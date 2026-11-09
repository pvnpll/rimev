import { describe, expect, it } from "vitest";
import {
  calculateStreak,
  formatLocalDate,
  getNextDayString,
  getPreviousDayString,
  getStartOfDayInTimezone,
  normalizeTimezone,
} from "@/lib/utils/timezone";

describe("Timezone & Streak Semantics (RM-203)", () => {
  describe("normalizeTimezone", () => {
    it("preserves valid IANA timezones", () => {
      expect(normalizeTimezone("UTC")).toBe("UTC");
      expect(normalizeTimezone("Asia/Kolkata")).toBe("Asia/Kolkata");
      expect(normalizeTimezone("America/New_York")).toBe("America/New_York");
      expect(normalizeTimezone("Europe/London")).toBe("Europe/London");
    });

    it("falls back to UTC on missing, empty, or invalid timezone strings", () => {
      expect(normalizeTimezone(undefined)).toBe("UTC");
      expect(normalizeTimezone(null)).toBe("UTC");
      expect(normalizeTimezone("")).toBe("UTC");
      expect(normalizeTimezone("   ")).toBe("UTC");
      expect(normalizeTimezone("Invalid/Not_A_Timezone")).toBe("UTC");
      expect(normalizeTimezone("Moon/Base")).toBe("UTC");
    });
  });

  describe("formatLocalDate around midnight across UTC, Asia/Kolkata, and America/New_York", () => {
    it("buckets reviews at 18:35 UTC to next day in Kolkata (00:05 IST) and current day in UTC and New York", () => {
      // 18:35 UTC on 9 Nov 2026:
      // UTC: 2026-11-09 18:35:00
      // Asia/Kolkata: 2026-11-10 00:05:00 (after midnight!)
      // America/New_York (EST): 2026-11-09 13:35:00
      const reviewInstant = new Date("2026-11-09T18:35:00.000Z");

      expect(formatLocalDate(reviewInstant, "UTC")).toBe("2026-11-09");
      expect(formatLocalDate(reviewInstant, "Asia/Kolkata")).toBe("2026-11-10");
      expect(formatLocalDate(reviewInstant, "America/New_York")).toBe("2026-11-09");
    });

    it("buckets reviews at 03:30 UTC to previous day in New York (22:30 EST) and current day in UTC and Kolkata", () => {
      // 03:30 UTC on 9 Nov 2026:
      // UTC: 2026-11-09 03:30:00
      // Asia/Kolkata: 2026-11-09 09:00:00
      // America/New_York (EST): 2026-11-08 22:30:00 (before midnight!)
      const reviewInstant = new Date("2026-11-09T03:30:00.000Z");

      expect(formatLocalDate(reviewInstant, "UTC")).toBe("2026-11-09");
      expect(formatLocalDate(reviewInstant, "Asia/Kolkata")).toBe("2026-11-09");
      expect(formatLocalDate(reviewInstant, "America/New_York")).toBe("2026-11-08");
    });

    it("correctly shifts date right at midnight in Asia/Kolkata", () => {
      // 18:29:59 UTC = 23:59:59 IST (still 9 Nov)
      const justBefore = new Date("2026-11-09T18:29:59.000Z");
      // 18:30:00 UTC = 00:00:00 IST (10 Nov starts!)
      const exactMidnight = new Date("2026-11-09T18:30:00.000Z");
      // 18:30:01 UTC = 00:00:01 IST (10 Nov)
      const justAfter = new Date("2026-11-09T18:30:01.000Z");

      expect(formatLocalDate(justBefore, "Asia/Kolkata")).toBe("2026-11-09");
      expect(formatLocalDate(exactMidnight, "Asia/Kolkata")).toBe("2026-11-10");
      expect(formatLocalDate(justAfter, "Asia/Kolkata")).toBe("2026-11-10");
    });

    it("handles Daylight Saving Time (DST) transitions in America/New_York", () => {
      // Fall DST transition (Sunday 1 Nov 2026: 2 AM EDT clocks turn back 1 hour to 1 AM EST)
      // 03:59:59 UTC = 23:59:59 EDT on Oct 31
      const preMidnightEDT = new Date("2026-11-01T03:59:59.000Z");
      // 04:00:00 UTC = 00:00:00 EDT on Nov 1
      const midnightEDT = new Date("2026-11-01T04:00:00.000Z");
      // 06:15:00 UTC = 01:15:00 EST on Nov 1 (post-transition)
      const postTransition = new Date("2026-11-01T06:15:00.000Z");

      expect(formatLocalDate(preMidnightEDT, "America/New_York")).toBe("2026-10-31");
      expect(formatLocalDate(midnightEDT, "America/New_York")).toBe("2026-11-01");
      expect(formatLocalDate(postTransition, "America/New_York")).toBe("2026-11-01");

      // Spring DST transition (Sunday 8 March 2026: 2 AM EST clocks jump forward to 3 AM EDT)
      // 04:59:59 UTC = 23:59:59 EST on March 7
      const preSpringMidnight = new Date("2026-03-08T04:59:59.000Z");
      // 05:00:00 UTC = 00:00:00 EST on March 8
      const springMidnight = new Date("2026-03-08T05:00:00.000Z");
      // 07:15:00 UTC = 03:15:00 EDT on March 8
      const postSpring = new Date("2026-03-08T07:15:00.000Z");

      expect(formatLocalDate(preSpringMidnight, "America/New_York")).toBe("2026-03-07");
      expect(formatLocalDate(springMidnight, "America/New_York")).toBe("2026-03-08");
      expect(formatLocalDate(postSpring, "America/New_York")).toBe("2026-03-08");
    });
  });

  describe("getStartOfDayInTimezone", () => {
    it("returns exact UTC start of local calendar day", () => {
      // When it is 10:00 AM in Kolkata on 9 Nov 2026 (04:30 UTC):
      // Kolkata start of day was 2026-11-08T18:30:00.000Z (00:00 IST on 9 Nov)
      const nowKolkata = new Date("2026-11-09T04:30:00.000Z");
      const kolkataStart = getStartOfDayInTimezone(nowKolkata, "Asia/Kolkata");
      expect(kolkataStart.toISOString()).toBe("2026-11-08T18:30:00.000Z");

      // When it is 10:00 AM UTC on 9 Nov 2026:
      const utcStart = getStartOfDayInTimezone(nowKolkata, "UTC");
      expect(utcStart.toISOString()).toBe("2026-11-09T00:00:00.000Z");

      // When it is 10:00 AM in New York on 9 Nov 2026 (15:00 UTC):
      // NY start of day was 2026-11-09T05:00:00.000Z (00:00 EST on 9 Nov)
      const nowNY = new Date("2026-11-09T15:00:00.000Z");
      const nyStart = getStartOfDayInTimezone(nowNY, "America/New_York");
      expect(nyStart.toISOString()).toBe("2026-11-09T05:00:00.000Z");
    });
  });

  describe("Calendar Day Traversal", () => {
    it("computes preceding and subsequent calendar days reliably across month and year boundaries", () => {
      expect(getPreviousDayString("2026-11-01")).toBe("2026-10-31");
      expect(getPreviousDayString("2026-01-01")).toBe("2025-12-31");
      expect(getPreviousDayString("2026-03-01")).toBe("2026-02-28");

      expect(getNextDayString("2026-10-31")).toBe("2026-11-01");
      expect(getNextDayString("2025-12-31")).toBe("2026-01-01");
    });
  });

  describe("calculateStreak semantics", () => {
    const today = "2026-11-09";

    it("returns 0 when there are no review logs", () => {
      expect(calculateStreak([], today)).toBe(0);
    });

    it("counts 1 day when the user has reviewed only today", () => {
      expect(calculateStreak(["2026-11-09"], today)).toBe(1);
    });

    it("preserves yesterday's streak when user opens app today before first review", () => {
      // User reviewed on 8 Nov and 7 Nov, but hasn't studied yet on 9 Nov (today).
      // Yesterday's streak of 2 days must remain active and visible!
      const streak = calculateStreak(["2026-11-08", "2026-11-07"], today);
      expect(streak).toBe(2);
    });

    it("increments the streak once the user completes today's first review", () => {
      // User reviewed on 8 Nov and 7 Nov, and now reviews on 9 Nov (today).
      const streak = calculateStreak(
        ["2026-11-09", "2026-11-08", "2026-11-07"],
        today
      );
      expect(streak).toBe(3);
    });

    it("resets streak to 0 if the user missed both today and yesterday", () => {
      // User studied on 7 Nov and 6 Nov, but missed 8 Nov (yesterday) and hasn't studied today (9 Nov).
      const streak = calculateStreak(["2026-11-07", "2026-07-06"], today);
      expect(streak).toBe(0);
    });

    it("handles duplicate reviews on the same day without inflating streak", () => {
      // Multiple reviews on the same day should only count as 1 day towards the streak
      const streak = calculateStreak(
        [
          "2026-11-09",
          "2026-11-09",
          "2026-11-08",
          "2026-11-08",
          "2026-11-07",
        ],
        today
      );
      expect(streak).toBe(3);
    });

    it("calculates a long multi-week streak accurately before today's review", () => {
      const dates: string[] = [];
      let cursor = "2026-11-08"; // ended yesterday
      for (let i = 0; i < 30; i++) {
        dates.push(cursor);
        cursor = getPreviousDayString(cursor);
      }

      // 30-day streak ending yesterday remains visible today before first review
      expect(calculateStreak(dates, today)).toBe(30);

      // Once reviewed today, becomes 31
      expect(calculateStreak([today, ...dates], today)).toBe(31);
    });
  });

  describe("Learner-local streak consistency under different timezones", () => {
    it("maintains consistent streaks when reviews occur near the learner's midnight", () => {
      // Learner in Asia/Kolkata studies at 11:45 PM IST on Nov 8 (18:15 UTC Nov 8)
      // and studies at 12:15 AM IST on Nov 10 (18:45 UTC Nov 9)
      // Notice: they reviewed on Nov 8 and Nov 10 IST, but skipped Nov 9 IST!
      const review1 = new Date("2026-11-08T18:15:00.000Z"); // 23:45 IST on Nov 8
      const review2 = new Date("2026-11-09T18:45:00.000Z"); // 00:15 IST on Nov 10

      const daysKolkata = [
        formatLocalDate(review2, "Asia/Kolkata"),
        formatLocalDate(review1, "Asia/Kolkata"),
      ];
      expect(daysKolkata).toEqual(["2026-11-10", "2026-11-08"]);

      // On Nov 10 IST, because Nov 9 was skipped, streak is 1 (only today's review)
      expect(calculateStreak(daysKolkata, "2026-11-10")).toBe(1);

      // Meanwhile for a UTC learner:
      // review1 is Nov 8 UTC, review2 is Nov 9 UTC (consecutive in UTC!)
      const daysUTC = [
        formatLocalDate(review2, "UTC"),
        formatLocalDate(review1, "UTC"),
      ];
      expect(daysUTC).toEqual(["2026-11-09", "2026-11-08"]);
      // On Nov 9 UTC, UTC learner has consecutive 2-day streak:
      expect(calculateStreak(daysUTC, "2026-11-09")).toBe(2);
    });
  });
});
