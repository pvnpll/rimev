/**
 * Timezone and calendar-day utilities for learner-local stats and streaks.
 */

/**
 * Validates and normalizes an IANA timezone identifier.
 * Defaults to "UTC" if unspecified, empty, or invalid.
 */
export function normalizeTimezone(timeZone?: string | null): string {
  if (!timeZone || typeof timeZone !== "string" || timeZone.trim() === "") {
    return "UTC";
  }

  const trimmed = timeZone.trim();
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return trimmed;
  } catch {
    return "UTC";
  }
}

/**
 * Formats a Date object into "YYYY-MM-DD" in the specified timezone.
 */
export function formatLocalDate(date: Date, timeZone: string = "UTC"): string {
  const normalized = normalizeTimezone(timeZone);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: normalized,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Computes the exact UTC Date instant corresponding to 00:00:00.000 on the
 * calendar day of `date` in the given timezone.
 */
export function getStartOfDayInTimezone(date: Date, timeZone: string = "UTC"): Date {
  const normalized = normalizeTimezone(timeZone);
  const localDayStr = formatLocalDate(date, normalized); // "YYYY-MM-DD"
  const [year, month, day] = localDayStr.split("-").map(Number);

  // Approximate UTC midnight for that calendar date
  const approxUtc = Date.UTC(year, month - 1, day, 0, 0, 0);

  // Compute timezone offset at approxUtc
  const offsetMs = getTimeZoneOffsetMs(new Date(approxUtc), normalized);
  let resolved = new Date(approxUtc - offsetMs);

  // Verify and adjust across DST boundaries if offset shifted at midnight
  const offsetMs2 = getTimeZoneOffsetMs(resolved, normalized);
  if (offsetMs2 !== offsetMs) {
    resolved = new Date(approxUtc - offsetMs2);
  }

  return resolved;
}

/**
 * Calculates the millisecond offset between the target timeZone and UTC.
 * (e.g. Asia/Kolkata is +5:30 -> +19,800,000 ms; New York EST is -5:00 -> -18,000,000 ms)
 */
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

/**
 * Returns the "YYYY-MM-DD" calendar date immediately preceding `dayString`.
 */
export function getPreviousDayString(dayString: string): string {
  const [year, month, day] = dayString.split("-").map(Number);
  // Noon UTC avoids any boundary or leap issues
  const prev = new Date(Date.UTC(year, month - 1, day - 1, 12, 0, 0));
  return prev.toISOString().slice(0, 10);
}

/**
 * Returns the "YYYY-MM-DD" calendar date immediately following `dayString`.
 */
export function getNextDayString(dayString: string): string {
  const [year, month, day] = dayString.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1, 12, 0, 0));
  return next.toISOString().slice(0, 10);
}

/**
 * Calculates current streak in days from an array of reviewed date strings ("YYYY-MM-DD")
 * relative to the user's current local date string ("YYYY-MM-DD").
 *
 * Rules:
 * - If user reviewed today: streak counts today and all consecutive preceding days.
 * - If user reviewed yesterday (but not yet today): yesterday's streak remains visible and active.
 * - If user reviewed neither today nor yesterday: streak is broken (0).
 */
export function calculateStreak(
  reviewedDayStrings: string[],
  todayDayString: string
): number {
  if (reviewedDayStrings.length === 0) return 0;

  const daySet = new Set(reviewedDayStrings);
  const yesterdayString = getPreviousDayString(todayDayString);

  let cursor: string;
  if (daySet.has(todayDayString)) {
    cursor = todayDayString;
  } else if (daySet.has(yesterdayString)) {
    cursor = yesterdayString;
  } else {
    return 0;
  }

  let streak = 0;
  while (daySet.has(cursor)) {
    streak++;
    cursor = getPreviousDayString(cursor);
  }

  return streak;
}
