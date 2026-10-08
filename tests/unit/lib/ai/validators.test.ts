import {
  generatedCardSchema,
  generatedCardsResultSchema,
  generationRequestSchema,
  learnerContextSchema,
} from "@/lib/validators/ai";
import { describe, expect, it } from "vitest";

describe("AI Validators", () => {
  describe("generationRequestSchema", () => {
    it("validates valid input and applies default batchSize and context", () => {
      const parsed = generationRequestSchema.parse({
        goal: "Learn conversational Kannada",
        topic: "Introductions",
        level: "beginner",
      });

      expect(parsed.goal).toBe("Learn conversational Kannada");
      expect(parsed.topic).toBe("Introductions");
      expect(parsed.level).toBe("beginner");
      expect(parsed.batchSize).toBe(10);
      expect(parsed.context.known).toEqual([]);
      expect(parsed.context.struggled).toEqual([]);
      expect(parsed.context.recentlySeen).toEqual([]);
      expect(parsed.context.preferences.romanization).toBe(true);
      expect(parsed.context.preferences.examples).toBe(true);
    });

    it("rejects batchSize below 1 or above 25", () => {
      expect(() =>
        generationRequestSchema.parse({
          goal: "Learn Kannada",
          topic: "Basics",
          level: "beginner",
          batchSize: 0,
        }),
      ).toThrow();

      expect(() =>
        generationRequestSchema.parse({
          goal: "Learn Kannada",
          topic: "Basics",
          level: "beginner",
          batchSize: 26,
        }),
      ).toThrow();
    });

    it("rejects invalid proficiency level", () => {
      expect(() =>
        generationRequestSchema.parse({
          goal: "Learn Kannada",
          topic: "Basics",
          level: "expert",
        }),
      ).toThrow();
    });

    it("rejects missing goal or topic", () => {
      expect(() =>
        generationRequestSchema.parse({
          topic: "Basics",
          level: "beginner",
        }),
      ).toThrow();

      expect(() =>
        generationRequestSchema.parse({
          goal: "Learn Kannada",
          level: "beginner",
        }),
      ).toThrow();
    });
  });

  describe("generatedCardSchema", () => {
    it("validates a complete card with all optional fields", () => {
      const card = generatedCardSchema.parse({
        front: "Hello",
        back: "Namaskara",
        pronunciation: "Namaskara",
        example: "Ellarigu namaskara",
        notes: "Formal greeting",
      });

      expect(card.front).toBe("Hello");
      expect(card.back).toBe("Namaskara");
      expect(card.pronunciation).toBe("Namaskara");
      expect(card.example).toBe("Ellarigu namaskara");
      expect(card.notes).toBe("Formal greeting");
    });

    it("validates a minimal card without optional fields", () => {
      const card = generatedCardSchema.parse({
        front: "Water",
        back: "Neeru",
      });

      expect(card.front).toBe("Water");
      expect(card.back).toBe("Neeru");
      expect(card.pronunciation).toBeUndefined();
    });

    it("rejects a card missing front or back", () => {
      expect(() =>
        generatedCardSchema.parse({
          front: "Hello",
        }),
      ).toThrow();

      expect(() =>
        generatedCardSchema.parse({
          back: "Namaskara",
        }),
      ).toThrow();
    });
  });

  describe("generatedCardsResultSchema", () => {
    it("validates a batch containing cards", () => {
      const result = generatedCardsResultSchema.parse({
        cards: [
          { front: "One", back: "Ondu" },
          { front: "Two", back: "Eradu" },
        ],
      });

      expect(result.cards).toHaveLength(2);
    });

    it("rejects an empty batch", () => {
      expect(() =>
        generatedCardsResultSchema.parse({
          cards: [],
        }),
      ).toThrow();
    });
  });

  describe("learnerContextSchema", () => {
    it("accepts populated context and preference overrides", () => {
      const context = learnerContextSchema.parse({
        known: ["Namaskara"],
        struggled: ["Hegiddira"],
        recentlySeen: ["Oota aayitha?"],
        preferences: {
          romanization: false,
          examples: true,
        },
      });

      expect(context.known).toEqual(["Namaskara"]);
      expect(context.struggled).toEqual(["Hegiddira"]);
      expect(context.recentlySeen).toEqual(["Oota aayitha?"]);
      expect(context.preferences.romanization).toBe(false);
      expect(context.preferences.examples).toBe(true);
    });
  });
});

