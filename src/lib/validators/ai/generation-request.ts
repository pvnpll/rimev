import { z } from "zod";
import { learnerContextSchema } from "./learner-context";

export const generationLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export const generationRequestSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(3, "Goal must be at least 3 characters")
    .max(200, "Goal must be at most 200 characters"),
  topic: z
    .string()
    .trim()
    .min(2, "Topic must be at least 2 characters")
    .max(100, "Topic must be at most 100 characters"),
  subjectKey: z.string().optional(),
  level: generationLevelSchema,
  batchSize: z
    .number()
    .int("Batch size must be an integer")
    .min(1, "Batch size must be at least 1")
    .max(25, "Batch size must be at most 25")
    .optional()
    .default(10),
  provider: z.enum(["gemini", "openrouter", "groq", "ollama"]).optional(),
  context: learnerContextSchema.optional().default({}),
});

export type GenerationLevel = z.infer<typeof generationLevelSchema>;
export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;

