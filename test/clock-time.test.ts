import { describe, it, expect } from "vitest";
import {
  formatClockTime,
  isOnLaterDay,
  parseClockTime,
  resolveClockTime,
} from "../src/clock-time";

/** Local-time instant, so the tests hold in any timezone. */
function local(y: number, mo: number, d: number, h: number, mi: number, s = 0): number {
  return new Date(y, mo - 1, d, h, mi, s, 0).getTime();
}

describe("parseClockTime", () => {
  it("parses HH:MM and HH.MM", () => {
    expect(parseClockTime("20:00")).toEqual({ hours: 20, minutes: 0 });
    expect(parseClockTime("20.00")).toEqual({ hours: 20, minutes: 0 });
    expect(parseClockTime("09:30")).toEqual({ hours: 9, minutes: 30 });
    expect(parseClockTime("9:05")).toEqual({ hours: 9, minutes: 5 });
    expect(parseClockTime("0:00")).toEqual({ hours: 0, minutes: 0 });
    expect(parseClockTime("23:59")).toEqual({ hours: 23, minutes: 59 });
  });

  it("parses a bare hour", () => {
    expect(parseClockTime("20")).toEqual({ hours: 20, minutes: 0 });
    expect(parseClockTime("8")).toEqual({ hours: 8, minutes: 0 });
    expect(parseClockTime("08")).toEqual({ hours: 8, minutes: 0 });
  });

  it("rejects out-of-range and malformed input", () => {
    expect(parseClockTime("24:00")).toBeNull();
    expect(parseClockTime("20:60")).toBeNull();
    expect(parseClockTime("20:5")).toBeNull();
    expect(parseClockTime("8pm")).toBeNull();
    expect(parseClockTime("20:00:00")).toBeNull();
    expect(parseClockTime("")).toBeNull();
    expect(parseClockTime("40m")).toBeNull();
    expect(parseClockTime("200")).toBeNull();
  });
});

describe("resolveClockTime", () => {
  it("resolves to today when the time is still ahead", () => {
    const now = local(2026, 10, 13, 18, 30);
    expect(resolveClockTime({ hours: 20, minutes: 0 }, now)).toBe(local(2026, 10, 13, 20, 0));
  });

  it("rolls to tomorrow when the time has passed", () => {
    const now = local(2026, 10, 13, 20, 5);
    expect(resolveClockTime({ hours: 20, minutes: 0 }, now)).toBe(local(2026, 10, 14, 20, 0));
  });

  it("treats the current minute as already passed", () => {
    const now = local(2026, 10, 13, 20, 0, 30);
    expect(resolveClockTime({ hours: 20, minutes: 0 }, now)).toBe(local(2026, 10, 14, 20, 0));
  });

  it("rolls across a month boundary", () => {
    const now = local(2026, 10, 31, 23, 0);
    expect(resolveClockTime({ hours: 9, minutes: 0 }, now)).toBe(local(2026, 11, 1, 9, 0));
  });
});

describe("isOnLaterDay", () => {
  it("distinguishes today from tomorrow", () => {
    const now = local(2026, 10, 13, 18, 30);
    expect(isOnLaterDay(local(2026, 10, 13, 20, 0), now)).toBe(false);
    expect(isOnLaterDay(local(2026, 10, 14, 9, 0), now)).toBe(true);
  });

  it("handles month and year boundaries", () => {
    expect(isOnLaterDay(local(2026, 11, 1, 1, 0), local(2026, 10, 31, 23, 0))).toBe(true);
    expect(isOnLaterDay(local(2027, 1, 1, 1, 0), local(2026, 12, 31, 23, 0))).toBe(true);
  });
});

describe("formatClockTime", () => {
  it("zero-pads", () => {
    expect(formatClockTime({ hours: 8, minutes: 5 })).toBe("08:05");
    expect(formatClockTime({ hours: 20, minutes: 0 })).toBe("20:00");
  });
});
