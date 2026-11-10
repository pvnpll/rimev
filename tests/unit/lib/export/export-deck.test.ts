import { describe, expect, it, vi, beforeEach } from "vitest";
import { exportService, getExportFilename } from "@/lib/services/export.service";
import { importDeckSchema } from "@/lib/validators/import.schema";
import { ApiError } from "@/types/api";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    deck: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";

describe("Deck Export Service (RM-202)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getExportFilename", () => {
    it("sanitizes titles with special characters, spaces, and punctuation", () => {
      expect(getExportFilename("Spanish (A1-A2) Vocabulary!")).toBe(
        "spanish-a1-a2-vocabulary-export.json",
      );
      expect(getExportFilename("Algorithms & Data Structures: 101")).toBe(
        "algorithms-data-structures-101-export.json",
      );
    });

    it("falls back to 'deck-export.json' for empty or symbol-only titles", () => {
      expect(getExportFilename("")).toBe("deck-export.json");
      expect(getExportFilename("   ")).toBe("deck-export.json");
      expect(getExportFilename("!@#$%^&*()")).toBe("deck-export.json");
    });
  });

  describe("exportService.exportDeck", () => {
    const ownerUserId = "user-owner-123";
    const crossUserId = "user-attacker-456";
    const deckId = "deck-uuid-111";

    it("successfully exports deck content with lessons, cards, and tags in stable order", async () => {
      const mockDeck = {
        id: deckId,
        userId: ownerUserId,
        title: "Japanese N5 Verbs",
        description: "Essential beginner Japanese verbs",
        isArchived: false,
        deckTags: [
          { tag: { name: "japanese" } },
          { tag: { name: "verbs" } },
        ],
        lessons: [
          {
            id: "lesson-1",
            deckId,
            title: "Godan Verbs",
            sortOrder: 0,
            createdAt: new Date("2026-01-01T00:00:00Z"),
            cards: [
              {
                id: "card-1",
                deckId,
                lessonId: "lesson-1",
                front: "行く (iku)",
                back: "to go",
                pronunciation: "iku",
                exampleSentence: "学校へ行く (Gakkou e iku - I go to school)",
                notes: "Godan verb with ku ending",
                imageUrl: null,
                audioUrl: null,
                isSuspended: false,
                createdAt: new Date("2026-01-01T00:00:00Z"),
                cardTags: [{ tag: { name: "godan" } }],
              },
              {
                id: "card-2",
                deckId,
                lessonId: "lesson-1",
                front: "飲む (nomu)",
                back: "to drink",
                pronunciation: "nomu",
                exampleSentence: "水を飲む (Mizu o nomu - Drink water)",
                notes: null,
                imageUrl: "https://example.com/unsupported-image.png",
                audioUrl: null,
                isSuspended: false,
                createdAt: new Date("2026-01-01T00:01:00Z"),
                cardTags: [{ tag: { name: "godan" } }, { tag: { name: "beverage" } }],
              },
            ],
          },
          {
            id: "lesson-2",
            deckId,
            title: "Ichidan Verbs",
            sortOrder: 1,
            createdAt: new Date("2026-01-02T00:00:00Z"),
            cards: [
              {
                id: "card-3",
                deckId,
                lessonId: "lesson-2",
                front: "食べる (taberu)",
                back: "to eat",
                pronunciation: "taberu",
                exampleSentence: "ご飯を食べる (Gohan o taberu - Eat a meal)",
                notes: "Ichidan verb with ru ending",
                imageUrl: null,
                audioUrl: null,
                isSuspended: false,
                createdAt: new Date("2026-01-02T00:00:00Z"),
                cardTags: [{ tag: { name: "ichidan" } }],
              },
            ],
          },
        ],
        cards: [], // No unassigned cards
      };

      vi.mocked(prisma.deck.findFirst).mockResolvedValueOnce(mockDeck as any);

      const result = await exportService.exportDeck(ownerUserId, deckId);

      expect(result.filename).toBe("japanese-n5-verbs-export.json");
      expect(result.data.version).toBe(1);
      expect(result.data.deck.title).toBe("Japanese N5 Verbs");
      expect(result.data.deck.description).toBe("Essential beginner Japanese verbs");
      expect(result.data.deck.tags).toEqual(["japanese", "verbs"]);

      expect(result.data.lessons).toHaveLength(2);
      expect(result.data.lessons[0].title).toBe("Godan Verbs");
      expect(result.data.lessons[0].cards).toHaveLength(2);
      expect(result.data.lessons[0].cards[0].front).toBe("行く (iku)");
      expect(result.data.lessons[0].cards[0].exampleSentence).toBe(
        "学校へ行く (Gakkou e iku - I go to school)",
      );
      expect(result.data.lessons[0].cards[0].example).toBe(
        "学校へ行く (Gakkou e iku - I go to school)",
      );
      expect(result.data.lessons[0].cards[0].tags).toEqual(["godan"]);

      // Verify that internal credentials / IDs are NOT leaked
      const rawJson = JSON.stringify(result.data);
      expect(rawJson).not.toContain(ownerUserId);
      expect(rawJson).not.toContain("lesson-1");
      expect(rawJson).not.toContain("card-1");
      expect(rawJson).not.toContain("unsupported-image.png");
    });

    it("groups unassigned cards into an additional lesson", async () => {
      const mockDeck = {
        id: deckId,
        userId: ownerUserId,
        title: "Mixed Cards Deck",
        description: null,
        isArchived: false,
        deckTags: [],
        lessons: [
          {
            id: "l-1",
            title: "Lesson A",
            sortOrder: 0,
            cards: [
              {
                front: "A",
                back: "Alpha",
                pronunciation: null,
                exampleSentence: null,
                notes: null,
                cardTags: [],
              },
            ],
          },
        ],
        cards: [
          {
            front: "Unassigned 1",
            back: "Value 1",
            pronunciation: null,
            exampleSentence: null,
            notes: null,
            cardTags: [],
          },
        ],
      };

      vi.mocked(prisma.deck.findFirst).mockResolvedValueOnce(mockDeck as any);

      const result = await exportService.exportDeck(ownerUserId, deckId);

      expect(result.data.lessons).toHaveLength(2);
      expect(result.data.lessons[0].title).toBe("Lesson A");
      expect(result.data.lessons[1].title).toBe("Unassigned Cards");
      expect(result.data.lessons[1].cards[0].front).toBe("Unassigned 1");
    });

    it("handles an empty deck by generating a placeholder lesson to satisfy importDeckSchema", async () => {
      const mockDeck = {
        id: deckId,
        userId: ownerUserId,
        title: "Empty Vocabulary Deck",
        description: null,
        isArchived: false,
        deckTags: [],
        lessons: [],
        cards: [],
      };

      vi.mocked(prisma.deck.findFirst).mockResolvedValueOnce(mockDeck as any);

      const result = await exportService.exportDeck(ownerUserId, deckId);

      expect(result.data.deck.title).toBe("Empty Vocabulary Deck");
      expect(result.data.lessons).toHaveLength(1);
      expect(result.data.lessons[0].title).toBe("General");
      expect(result.data.lessons[0].cards).toHaveLength(0);

      // Verify that this empty deck payload passes importDeckSchema
      const parsed = importDeckSchema.safeParse(result.data);
      expect(parsed.success).toBe(true);
    });

    it("denies cross-user export requests with 403 Forbidden", async () => {
      vi.mocked(prisma.deck.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.deck.findUnique).mockResolvedValue({
        id: deckId,
        userId: ownerUserId,
      } as any);

      await expect(
        exportService.exportDeck(crossUserId, deckId),
      ).rejects.toThrowError(ApiError);

      try {
        await exportService.exportDeck(crossUserId, deckId);
      } catch (err) {
        expect((err as ApiError).status).toBe(403);
        expect((err as ApiError).code).toBe("FORBIDDEN");
      }
    });

    it("throws 404 when deck does not exist at all", async () => {
      vi.mocked(prisma.deck.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.deck.findUnique).mockResolvedValue(null);

      await expect(
        exportService.exportDeck(ownerUserId, "non-existent-id"),
      ).rejects.toThrowError(ApiError);

      try {
        await exportService.exportDeck(ownerUserId, "non-existent-id");
      } catch (err) {
        expect((err as ApiError).status).toBe(404);
        expect((err as ApiError).code).toBe("NOT_FOUND");
      }
    });

    it("round-trips through importDeckSchema with full data integrity", async () => {
      const mockDeck = {
        id: deckId,
        userId: ownerUserId,
        title: "French Travel Phrases",
        description: "Essential travel vocabulary",
        isArchived: false,
        deckTags: [{ tag: { name: "french" } }, { tag: { name: "travel" } }],
        lessons: [
          {
            id: "l-1",
            title: "At the Airport",
            sortOrder: 0,
            cards: [
              {
                front: "Où sont les bagages?",
                back: "Where is the luggage?",
                pronunciation: "oo sawn lay bah-gahzh",
                exampleSentence: "Excusez-moi, où sont les bagages?",
                notes: "Polite inquiry",
                cardTags: [{ tag: { name: "airport" } }],
              },
            ],
          },
          {
            id: "l-2",
            title: "At the Hotel",
            sortOrder: 1,
            cards: [
              {
                front: "J'ai une réservation",
                back: "I have a reservation",
                pronunciation: "zhay oon ray-zehr-vah-syohn",
                exampleSentence: "Bonjour, j'ai une réservation au nom de Smith.",
                notes: "Check-in phrase",
                cardTags: [{ tag: { name: "hotel" } }],
              },
            ],
          },
        ],
        cards: [],
      };

      vi.mocked(prisma.deck.findFirst).mockResolvedValueOnce(mockDeck as any);

      const exported = await exportService.exportDeck(ownerUserId, deckId);

      // Verify validation passes through importDeckSchema
      const importParseResult = importDeckSchema.safeParse(exported.data);
      expect(importParseResult.success).toBe(true);

      if (importParseResult.success) {
        const imported = importParseResult.data;
        expect(imported.deck.title).toBe(mockDeck.title);
        expect(imported.deck.description).toBe(mockDeck.description);
        expect(imported.deck.tags).toEqual(["french", "travel"]);

        expect(imported.lessons).toHaveLength(2);
        expect(imported.lessons[0].title).toBe("At the Airport");
        expect(imported.lessons[0].cards[0].front).toBe("Où sont les bagages?");
        expect(imported.lessons[0].cards[0].back).toBe("Where is the luggage?");
        expect(imported.lessons[0].cards[0].pronunciation).toBe("oo sawn lay bah-gahzh");
        expect(imported.lessons[0].cards[0].exampleSentence).toBe(
          "Excusez-moi, où sont les bagages?",
        );
        expect(imported.lessons[0].cards[0].tags).toEqual(["airport"]);

        expect(imported.lessons[1].title).toBe("At the Hotel");
        expect(imported.lessons[1].cards[0].front).toBe("J'ai une réservation");
        expect(imported.lessons[1].cards[0].back).toBe("I have a reservation");
        expect(imported.lessons[1].cards[0].tags).toEqual(["hotel"]);
      }
    });
  });
});
