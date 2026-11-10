import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/types/api";

export interface ExportCardData {
  front: string;
  back: string;
  pronunciation?: string | null;
  example?: string | null;
  exampleSentence?: string | null;
  notes?: string | null;
  tags: string[];
}

export interface ExportLessonData {
  title: string;
  description?: string | null;
  cards: ExportCardData[];
}

export interface ExportDeckPayload {
  version: number;
  exportedAt: string;
  deck: {
    title: string;
    description: string | null;
    tags: string[];
  };
  lessons: ExportLessonData[];
}

export function getExportFilename(title: string): string {
  const clean = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${clean || "deck"}-export.json`;
}

export const exportService = {
  async exportDeck(
    userId: string,
    deckId: string,
  ): Promise<{ data: ExportDeckPayload; filename: string }> {
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId, isArchived: false },
      include: {
        deckTags: {
          include: { tag: true },
        },
        lessons: {
          orderBy: { sortOrder: "asc" },
          include: {
            cards: {
              where: { isSuspended: false },
              orderBy: { createdAt: "asc" },
              include: {
                cardTags: {
                  include: { tag: true },
                },
              },
            },
          },
        },
        cards: {
          where: { isSuspended: false, lessonId: null },
          orderBy: { createdAt: "asc" },
          include: {
            cardTags: {
              include: { tag: true },
            },
          },
        },
      },
    });

    if (!deck) {
      const otherUserDeck = await prisma.deck.findUnique({
        where: { id: deckId },
        select: { id: true, userId: true },
      });
      if (otherUserDeck && otherUserDeck.userId !== userId) {
        throw new ApiError(403, "FORBIDDEN", "You do not have permission to export this deck");
      }
      throw new ApiError(404, "NOT_FOUND", "Deck not found");
    }

    const deckTags = Array.from(
      new Set(deck.deckTags.map((dt) => dt.tag.name.trim()).filter(Boolean)),
    );

    const mapCard = (card: (typeof deck.cards)[number]): ExportCardData => {
      const cardTags = Array.from(
        new Set(card.cardTags.map((ct) => ct.tag.name.trim()).filter(Boolean)),
      );

      const example = card.exampleSentence?.trim() || null;

      return {
        front: card.front.trim(),
        back: card.back.trim(),
        pronunciation: card.pronunciation?.trim() || null,
        example,
        exampleSentence: example,
        notes: card.notes?.trim() || null,
        tags: cardTags,
      };
    };

    const lessons: ExportLessonData[] = deck.lessons.map((lesson) => ({
      title: lesson.title.trim(),
      description: null,
      cards: lesson.cards.map(mapCard),
    }));

    if (deck.cards.length > 0) {
      const unassignedTitle = lessons.length === 0 ? "General" : "Unassigned Cards";
      lessons.push({
        title: unassignedTitle,
        description: null,
        cards: deck.cards.map(mapCard),
      });
    }

    // Ensure at least one lesson so empty decks conform to importDeckSchema (.min(1))
    if (lessons.length === 0) {
      lessons.push({
        title: "General",
        description: null,
        cards: [],
      });
    }

    const data: ExportDeckPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      deck: {
        title: deck.title.trim(),
        description: deck.description?.trim() || null,
        tags: deckTags,
      },
      lessons,
    };

    const filename = getExportFilename(deck.title);

    return { data, filename };
  },
};
