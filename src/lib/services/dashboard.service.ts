import { RECENT_DECK_LIMIT } from "@/lib/constants/deck-limits";
import { deckRepository } from "@/lib/repositories/deck.repository";
import { statsRepository, type DailySummaryOptions } from "@/lib/repositories/stats.repository";
import type { DeckWithStats } from "@/types/deck";

export interface DashboardSummary {
  dueToday: number;
  reviewedToday: number;
  totalCards: number;
  matureCards: number;
  deckCount: number;
  streak: number;
  recentDecks: DeckWithStats[];
}

export const dashboardService = {
  async getSummary(userId: string, options?: DailySummaryOptions): Promise<DashboardSummary> {
    const [summary, recentDecks] = await Promise.all([
      statsRepository.getDailySummary(userId, options),
      deckRepository.findRecentByUser(userId, RECENT_DECK_LIMIT),
    ]);

    return {
      ...summary,
      recentDecks,
    };
  },
};
