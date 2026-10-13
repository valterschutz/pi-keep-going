/**
 * Clock-time parsing for the `/at` command.
 *
 * Accepts a local wall-clock time as `HH:MM`, `HH.MM`, or a bare hour (`20`,
 * `8`). Hours run 0-23 and minutes 0-59; a single-digit hour is fine. There is
 * no date, am/pm, or timezone syntax: the time is resolved against the local
 * clock, and a time that has already passed today rolls over to tomorrow.
 */

const CLOCK_TIME_PATTERN = /^(\d{1,2})(?:[:.](\d{2}))?$/;

export interface ClockTime {
  hours: number;
  minutes: number;
}

/** Parse `HH:MM`, `HH.MM`, or `HH`; `null` on any malformed or out-of-range input. */
export function parseClockTime(input: string): ClockTime | null {
  const match = CLOCK_TIME_PATTERN.exec(input.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/**
 * Resolve a clock time to the next epoch-ms instant it names, relative to
 * `now`: today if still ahead, otherwise the same time tomorrow. The exact
 * current minute counts as already passed, so `/at 20:00` typed at 20:00:30
 * fires tomorrow rather than immediately.
 */
export function resolveClockTime(time: ClockTime, now: number): number {
  const target = new Date(now);
  target.setHours(time.hours, time.minutes, 0, 0);
  if (target.getTime() <= now) target.setDate(target.getDate() + 1);
  return target.getTime();
}

/** `true` when `fireAt` falls on a later calendar day than `now` (local time). */
export function isOnLaterDay(fireAt: number, now: number): boolean {
  const a = new Date(now);
  const b = new Date(fireAt);
  return (
    b.getFullYear() > a.getFullYear() ||
    b.getMonth() > a.getMonth() ||
    b.getDate() > a.getDate()
  );
}

/** Format a clock time as zero-padded `HH:MM`. */
export function formatClockTime(time: ClockTime): string {
  return `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`;
}
