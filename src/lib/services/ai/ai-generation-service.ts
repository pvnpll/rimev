import {
  AIProvider,
  AIProviderError,
  createAIProvider,
  ProviderGenerateCardsResult,
  ProviderTokenUsage,
} from "@/lib/providers/ai";
import {
  GeneratedCard,
  generatedCardsResultSchema,
  GenerationRequestInput,
  generationRequestSchema,
  LearnerContext,
} from "@/lib/validators/ai";
import { filterDuplicateCards } from "./dedup-filter";
import { buildGenerationPrompts } from "./prompt-builder";
import { aiContextService } from "./ai-context-service";

export interface AIGenerationServiceOptions {
  provider?: AIProvider;
  maxRetries?: number;
}

export interface GenerationServiceMeta {
  provider: string;
  model: string;
  batchSize: number;
  generatedAt: string;
  duplicatesFiltered?: number;
  usage?: ProviderTokenUsage;
}

export interface GenerationServiceResult {
  cards: GeneratedCard[];
  meta: GenerationServiceMeta;
  context: LearnerContext; // Added to return the merged context
}

export class AIGenerationService {
  private readonly provider?: AIProvider;
  private readonly maxRetries: number;

  constructor(options: AIGenerationServiceOptions = {}) {
    this.provider = options.provider;
    this.maxRetries = options.maxRetries ?? 1; // 1 retry (2 attempts max) to fit within Vercel's 60s maxDuration
  }

  async generateCurriculum(rawInput: unknown): Promise<import("@/lib/validators/ai").CurriculumResponse> {
    const { curriculumRequestSchema, curriculumResponseSchema } = await import("@/lib/validators/ai");
    const input = curriculumRequestSchema.parse(rawInput);
    
    // We prefer a fast model like Gemini Flash or OpenRouter's Gemma for this reasoning task
    
    const systemPrompt = `You are a curriculum generation AI. The user is studying towards a specific goal.
They have just finished studying the topic: "${input.currentTopic}".
Their overarching goal is: "${input.goal}".
They have already mastered the following concepts:
${input.knownConcepts.slice(-30).map(c => `- ${c}`).join("\n")}

Based on this, what is the single next most logical topic they should study?
Respond strictly in JSON matching the schema, with 'nextTopic' and 'reasoning'.`;

    // Temporary mock for provider interface (since providers are geared towards cards)
    // Wait, providers generate cards. We need a raw generate json method. 
    // Actually, we can just use the provider to generate a "card" but trick it.
    // Let's just fetch from OpenRouter / Gemini directly here since it's a simple one-off task.
    try {
      if (process.env.OPENROUTER_API_KEY) {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemma-2-9b-it:free",
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: systemPrompt }],
          })
        });
        const data = await res.json();
        const jsonStr = data.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(jsonStr.replace(/```json/g, "").replace(/```/g, ""));
        return curriculumResponseSchema.parse(parsed);
      } else {
        throw new Error("No API key available for curriculum generation");
      }
    } catch (err) {
      console.warn("Curriculum generation failed", err);
      return { nextTopic: "Continue Practice", reasoning: "Keep reinforcing your current knowledge." };
    }
  }

  async generate(rawInput: unknown, userId?: string): Promise<GenerationServiceResult> {
    const input: GenerationRequestInput = generationRequestSchema.parse(rawInput);
    let provider = this.provider ?? createAIProvider({ providerName: input.provider });

    // If userId is provided, merge server-side context with client context
    if (userId) {
      const dbKey = input.subjectKey || input.topic;
      const serverContext = await aiContextService.getContext(userId, dbKey);
      
      if (userId.startsWith("guest_") && serverContext.recentlySeen.length >= 30) {
        throw new AIProviderError(
          "Guest limit reached! You have generated 30 cards. Please create a free account to continue learning.",
          "RATE_LIMITED",
          403
        );
      }

      input.context = {
        known: Array.from(new Set([...serverContext.known, ...(input.context?.known || [])])),
        struggled: Array.from(new Set([...serverContext.struggled, ...(input.context?.struggled || [])])),
        recentlySeen: Array.from(new Set([...serverContext.recentlySeen, ...(input.context?.recentlySeen || [])])),
        preferences: { ...serverContext.preferences, ...input.context?.preferences },
      };
    }

    // Prepare fallback provider: Groq/Ollama → OpenRouter only. Gemini disabled.
    let fallbackProvider: AIProvider | null = null;
    if (!this.provider && (provider.name === "groq" || provider.name === "ollama")) {
      if (process.env.OPENROUTER_API_KEY) {
        try {
          fallbackProvider = createAIProvider({ providerName: "openrouter" });
        } catch { /* ignore */ }
      }
    }

    const prompts = buildGenerationPrompts(input);
    let userPrompt = prompts.userPrompt;
    const systemPrompt = prompts.systemPrompt;

    let lastResult: ProviderGenerateCardsResult | null = null;
    const cumulativeCards: GeneratedCard[] = [];
    let totalDuplicatesFiltered = 0;
    let lastError: Error | null = null;
    let currentUsage: ProviderTokenUsage = { model: "", promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (cumulativeCards.length >= input.batchSize) {
        break; // We have enough cards
      }

      const cardsNeeded = input.batchSize - cumulativeCards.length;

      try {
        lastResult = await provider.generateCards({
          goal: input.goal,
          topic: input.topic,
          level: input.level,
          batchSize: cardsNeeded, // request only the remaining cards
          context: {
            ...input.context,
            // Include newly accumulated cards in recentlySeen to prevent dupes in the same batch
            recentlySeen: [
              ...input.context.recentlySeen,
              ...cumulativeCards.map((c) => c.front),
            ],
          },
          systemPrompt,
          userPrompt,
        });

        // Accumulate token usage if available
        if (lastResult.usage) {
          currentUsage = {
            model: lastResult.usage.model,
            promptTokens: (currentUsage.promptTokens || 0) + (lastResult.usage.promptTokens || 0),
            completionTokens: (currentUsage.completionTokens || 0) + (lastResult.usage.completionTokens || 0),
            totalTokens: (currentUsage.totalTokens || 0) + (lastResult.usage.totalTokens || 0),
          };
        }

        const parseResult = generatedCardsResultSchema.safeParse({
          cards: lastResult.cards,
        });

        if (parseResult.success) {
          const newlyGenerated = parseResult.data.cards;
          
          // Dedup right away
          const dedupResult = filterDuplicateCards(newlyGenerated, {
            known: input.context.known,
            recentlySeen: [
              ...input.context.recentlySeen,
              ...cumulativeCards.map((c) => c.front),
            ],
          });

          cumulativeCards.push(...dedupResult.cards);
          totalDuplicatesFiltered += dedupResult.duplicatesRemoved;

          if (cumulativeCards.length >= input.batchSize) {
            break; // Done
          } else {
            // Not enough cards! Modify prompt to push harder for new concepts
            userPrompt += `\n\nNOTE: You just generated ${dedupResult.duplicatesRemoved} duplicate concepts that we already know. PLEASE generate ${input.batchSize - cumulativeCards.length} COMPLETELY DIFFERENT and NOVEL concepts about ${input.topic} that are NOT in the recently seen or known lists!`;
          }
        } else {
          lastError = new Error(
            `Validation failed: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
          );
          // Adjust prompt for next retry
          userPrompt += `\n\nNOTE: The previous generation failed schema validation (${parseResult.error.errors[0]?.message}). Please strictly return valid JSON according to the schema.`;
        }
      } catch (err) {
        if (err instanceof AIProviderError && err.code === "PROVIDER_AUTH_FAILED") {
          throw err;
        }

        if (fallbackProvider) {
          console.warn(
            `Primary provider (${provider.name}) failed (${err instanceof Error ? err.message : String(err)}), switching to fallback provider (${fallbackProvider.name})`,
          );
          provider = fallbackProvider;
          fallbackProvider = null;
          continue;
        }


        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (cumulativeCards.length === 0) {
      if (lastError instanceof AIProviderError) {
        throw lastError;
      }
      // If we filtered out EVERYTHING but had no parsing errors
      if (totalDuplicatesFiltered > 0 && !lastError) {
        throw new AIProviderError(
          "All generated cards were duplicates of existing known or recently seen content",
          "EMPTY_GENERATION",
          502,
        );
      }
      throw new AIProviderError(
        `AI card generation failed after ${this.maxRetries + 1} attempts: ${lastError?.message || "Invalid output"}`,
        "GENERATION_FAILED",
        502,
        lastError,
      );
    }

    const modelName =
      (currentUsage.model ? currentUsage.model : undefined) ||
      lastResult?.usage?.model ||
      (provider.name === "openrouter"
        ? "meta-llama/llama-3.3-70b-instruct:free"
        : provider.name === "groq"
        ? (process.env.GROQ_MODEL || "llama-3.3-70b-versatile")
        : provider.name === "ollama"
        ? (process.env.OLLAMA_MODEL || "gemma4:31b")
        : "gemini-3.6-flash");

    const finalCards = cumulativeCards.slice(0, input.batchSize);

    // Asynchronously update DB context if userId is present
    if (userId) {
      const dbKey = input.subjectKey || input.topic;
      aiContextService.updateContext(userId, dbKey, {
        recentlySeen: finalCards.map(c => c.front)
      }).catch(err => console.error("Failed to update context recentlySeen", err));
    }

    return {
      cards: finalCards,
      meta: {
        provider: provider.name,
        model: modelName,
        batchSize: finalCards.length,
        generatedAt: new Date().toISOString(),
        duplicatesFiltered: totalDuplicatesFiltered,
        usage: currentUsage.model ? currentUsage : lastResult?.usage,
      },
      context: input.context as LearnerContext,
    };
  }

  async generateStream(
    rawInput: unknown,
    userId: string | undefined,
    onCard: (card: GeneratedCard) => void,
  ): Promise<GenerationServiceResult> {
    const input: GenerationRequestInput = generationRequestSchema.parse(rawInput);
    const provider = this.provider ?? createAIProvider({ providerName: input.provider });

    // If userId is provided, merge server-side context with client context
    if (userId) {
      const dbKey = input.subjectKey || input.topic;
      const serverContext = await aiContextService.getContext(userId, dbKey);
      input.context = {
        known: Array.from(new Set([...serverContext.known, ...(input.context?.known || [])])),
        struggled: Array.from(new Set([...serverContext.struggled, ...(input.context?.struggled || [])])),
        recentlySeen: Array.from(new Set([...serverContext.recentlySeen, ...(input.context?.recentlySeen || [])])),
        preferences: { ...serverContext.preferences, ...input.context?.preferences },
      };
    }

    // Prepare fallback provider: Groq/Ollama → OpenRouter only. Gemini disabled.
    let fallbackProvider: AIProvider | null = null;
    if (!this.provider && (provider.name === "groq" || provider.name === "ollama")) {
      if (process.env.OPENROUTER_API_KEY) {
        try {
          fallbackProvider = createAIProvider({ providerName: "openrouter" });
        } catch { /* ignore */ }
      }
    }

    const prompts = buildGenerationPrompts(input);
    const cumulativeCards: GeneratedCard[] = [];
    let totalDuplicatesFiltered = 0;
    let lastResult: ProviderGenerateCardsResult | null = null;
    let currentUsage: ProviderTokenUsage = { model: "", promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    let userPrompt = prompts.userPrompt;
    const systemPrompt = prompts.systemPrompt;

    const attemptGeneration = async (currentProvider: AIProvider) => {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        if (cumulativeCards.length >= input.batchSize) break;
        
        const cardsNeeded = input.batchSize - cumulativeCards.length;

        lastResult = await currentProvider.generateCards({
          goal: input.goal,
          topic: input.topic,
          level: input.level,
          batchSize: cardsNeeded,
          context: {
            ...input.context,
            recentlySeen: [
              ...input.context.recentlySeen,
              ...cumulativeCards.map((c) => c.front),
            ],
          },
          systemPrompt,
          userPrompt,
        });

        if (lastResult.usage) {
          currentUsage = {
            model: lastResult.usage.model,
            promptTokens: (currentUsage.promptTokens || 0) + (lastResult.usage.promptTokens || 0),
            completionTokens: (currentUsage.completionTokens || 0) + (lastResult.usage.completionTokens || 0),
            totalTokens: (currentUsage.totalTokens || 0) + (lastResult.usage.totalTokens || 0),
          };
        }

        const parseResult = generatedCardsResultSchema.safeParse({ cards: lastResult.cards });
        if (parseResult.success) {
          const newlyGenerated = parseResult.data.cards;
          
          const dedupResult = filterDuplicateCards(newlyGenerated, {
            known: input.context.known,
            recentlySeen: [
              ...input.context.recentlySeen,
              ...cumulativeCards.map((c) => c.front),
            ],
          });

          totalDuplicatesFiltered += dedupResult.duplicatesRemoved;

          // Emit cards one-by-one
          for (const card of dedupResult.cards) {
            if (cumulativeCards.length >= input.batchSize) break;
            cumulativeCards.push(card);
            onCard(card);
          }
          
          if (cumulativeCards.length < input.batchSize) {
            userPrompt += `\n\nNOTE: You just generated ${dedupResult.duplicatesRemoved} duplicate concepts that we already know. PLEASE generate ${input.batchSize - cumulativeCards.length} COMPLETELY DIFFERENT and NOVEL concepts about ${input.topic} that are NOT in the recently seen or known lists!`;
          }
        } else {
          userPrompt += `\n\nNOTE: The previous generation failed schema validation (${parseResult.error.errors[0]?.message}). Please strictly return valid JSON according to the schema.`;
        }
      }
    };

    let primaryError: Error | null = null;
    try {
      await attemptGeneration(provider);
    } catch (err) {
      primaryError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof AIProviderError && err.code === "PROVIDER_AUTH_FAILED") {
        throw err;
      }

      // Try fallback provider
      if (fallbackProvider) {
        console.warn(
          `Primary provider (${provider.name}) failed: ${primaryError.message}, trying fallback (${fallbackProvider.name})`,
        );
        try {
          await attemptGeneration(fallbackProvider);
        } catch (fallbackErr) {
          // Both providers failed
          if (cumulativeCards.length === 0) {
            const fallbackMsg =
              fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
            throw new AIProviderError(
              `${provider.name.toUpperCase()} failed: ${primaryError.message}. (Fallback ${fallbackProvider.name} also failed: ${fallbackMsg})`,
              "GENERATION_FAILED",
              502,
              fallbackErr,
            );
          }
        }
      } else if (cumulativeCards.length === 0) {
        throw err;
      }
    }

    if (cumulativeCards.length === 0) {
      if (totalDuplicatesFiltered > 0) {
        throw new AIProviderError(
          "All generated cards were duplicates of existing known or recently seen content",
          "EMPTY_GENERATION",
          502,
        );
      }
      throw new AIProviderError(
        "AI card generation failed: no cards were produced",
        "GENERATION_FAILED",
        502,
      );
    }

    const finalCards = cumulativeCards.slice(0, input.batchSize);

    // Asynchronously update DB context if userId is present
    if (userId) {
      const dbKey = input.subjectKey || input.topic;
      aiContextService.updateContext(userId, dbKey, {
        recentlySeen: finalCards.map(c => c.front)
      }).catch(err => console.error("Failed to update context recentlySeen", err));
    }

    const modelName =
      (currentUsage.model ? currentUsage.model : undefined) ||
      (lastResult as ProviderGenerateCardsResult | null)?.usage?.model ||
      (provider.name === "openrouter"
        ? "meta-llama/llama-3.3-70b-instruct:free"
        : provider.name === "groq"
        ? (process.env.GROQ_MODEL || "llama-3.3-70b-versatile")
        : provider.name === "ollama"
        ? (process.env.OLLAMA_MODEL || "gemma4:31b")
        : "gemini-3.6-flash");

    return {
      cards: finalCards,
      meta: {
        provider: provider.name,
        model: modelName,
        batchSize: finalCards.length,
        generatedAt: new Date().toISOString(),
        duplicatesFiltered: totalDuplicatesFiltered,
        usage: currentUsage.model ? currentUsage : (lastResult as ProviderGenerateCardsResult | null)?.usage,
      },
      context: input.context as LearnerContext,
    };
  }
}

export const aiGenerationService = new AIGenerationService();

