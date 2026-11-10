import { GeneratedCard, GenerationLevel, LearnerContext } from "@/lib/validators/ai";

export interface AISessionState {
  goal: string;
  topic: string;
  subjectKey: string;
  level: GenerationLevel;
  batchSize: number;
  provider?: "gemini" | "openrouter" | "groq" | "ollama";
  cards: GeneratedCard[];
  context: LearnerContext;
  currentIndex: number;
  lastModel?: string;
}

export interface GenerateCardsApiParams {
  goal: string;
  topic: string;
  subjectKey?: string;
  level: GenerationLevel;
  batchSize?: number;
  provider?: "gemini" | "openrouter" | "groq" | "ollama";
  context?: LearnerContext;
}

export interface GenerateCardsApiResponse {
  cards: GeneratedCard[];
  meta: {
    provider: string;
    model: string;
    batchSize: number;
    generatedAt: string;
    duplicatesFiltered?: number;
  };
  context: LearnerContext;
}

