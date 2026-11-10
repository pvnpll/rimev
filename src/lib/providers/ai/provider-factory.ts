import { AIProvider, AIProviderError } from "./ai-provider";
import { GeminiProvider, GeminiProviderOptions } from "./gemini-provider";
import { OpenRouterProvider, OpenRouterProviderOptions } from "./openrouter-provider";
import { OllamaCloudProvider, OllamaCloudProviderOptions } from "./ollama-cloud-provider";
import { GroqProvider, GroqProviderOptions } from "./groq-provider";

export interface ProviderFactoryOptions {
  providerName?: string;
  geminiOptions?: GeminiProviderOptions;
  openrouterOptions?: OpenRouterProviderOptions;
  groqOptions?: GroqProviderOptions;
  ollamaOptions?: OllamaCloudProviderOptions;
}

export function createAIProvider(options: ProviderFactoryOptions = {}): AIProvider {
  let providerName =
    options.providerName || process.env.AI_PROVIDER?.toLowerCase();

  if (!providerName) {
    if (process.env.GROQ_API_KEY) {
      providerName = "groq";
    } else if (process.env.OPENROUTER_API_KEY) {
      providerName = "openrouter";
    } else if (process.env.OLLAMA_API_KEY) {
      providerName = "ollama";
    } else {
      providerName = "groq";
    }
  }

  switch (providerName) {
    case "groq":
      return new GroqProvider(options.groqOptions);
    case "gemini":
      return new GeminiProvider(options.geminiOptions);
    case "openrouter":
      return new OpenRouterProvider(options.openrouterOptions);
    case "ollama":
      return new OllamaCloudProvider(options.ollamaOptions);
    default:
      throw new AIProviderError(
        `Unsupported AI provider: ${providerName}`,
        "PROVIDER_UNAVAILABLE",
        503,
      );
  }
}
