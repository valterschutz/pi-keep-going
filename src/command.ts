import { parseDuration } from "./duration";
import { parseClockTime, type ClockTime } from "./clock-time";

/** Parsed `/kg` command, decoupled from any Pi context for unit testing. */
export type KgCommand =
  | { kind: "schedule"; seconds: number; message: string }
  | { kind: "auto"; message: string }
  | { kind: "list" }
  | { kind: "cancel" }
  | { kind: "help" }
  | { kind: "error"; reason: string };

/**
 * Parse the raw argument string of `/kg`.
 *
 * Grammar: `<duration|auto|list|cancel|help> [message...]`. An empty input is
 * treated as `help`. The first token is a subcommand or a duration; the
 * remainder is the message (defaulting to `defaultMessage`).
 */
export function parseKgCommand(args: string, defaultMessage: string): KgCommand {
  const trimmed = args.trim();
  if (trimmed === "") return { kind: "help" };

  const [first, ...rest] = trimmed.split(/\s+/);
  const message = rest.join(" ").trim() || defaultMessage;

  switch (first.toLowerCase()) {
    case "help":
      return { kind: "help" };
    case "list":
      return { kind: "list" };
    case "cancel":
      return { kind: "cancel" };
    case "auto":
      return { kind: "auto", message };
  }

  const seconds = parseDuration(first);
  if (seconds === null) {
    return {
      kind: "error",
      reason: `Invalid duration "${first}". Use e.g. 40m, 2h30m, 90s, or "auto".`,
    };
  }
  return { kind: "schedule", seconds, message };
}

/** Parsed `/in` command, decoupled from any Pi context for unit testing. */
export type InCommand =
  | { kind: "schedule"; seconds: number; message: string }
  | { kind: "help" }
  | { kind: "error"; reason: string };

/**
 * Parse the raw argument string of `/in`.
 *
 * Grammar: `<duration> [message...]`, where the duration may span several
 * tokens as long as each unit directly follows its number (`20 min`,
 * `1 hour 30 minutes`, `2h30m`). Leading tokens are consumed greedily while
 * they still form a valid duration; the remainder is the message (defaulting
 * to `defaultMessage`). Listing and cancelling go through `/kg`.
 */
export function parseInCommand(args: string, defaultMessage: string): InCommand {
  const trimmed = args.trim();
  if (trimmed === "") return { kind: "help" };

  const tokens = trimmed.split(/\s+/);
  if (tokens[0].toLowerCase() === "help") return { kind: "help" };

  let seconds: number | null = null;
  let consumed = 0;
  for (let n = 1; n <= tokens.length; n += 1) {
    const candidate = parseDuration(tokens.slice(0, n).join(" "));
    if (candidate === null) {
      // A bare trailing number may still be completed by the next token.
      if (/^\d+$/.test(tokens[n - 1]) && n < tokens.length) continue;
      break;
    }
    seconds = candidate;
    consumed = n;
  }

  if (seconds === null) {
    return {
      kind: "error",
      reason: `Invalid duration "${tokens[0]}". Use e.g. 20min, 40m, 2h30m, or 90s.`,
    };
  }
  const message = tokens.slice(consumed).join(" ").trim() || defaultMessage;
  return { kind: "schedule", seconds, message };
}

/** Parsed `/at` command, decoupled from any Pi context for unit testing. */
export type AtCommand =
  | { kind: "schedule"; time: ClockTime; message: string }
  | { kind: "help" }
  | { kind: "error"; reason: string };

/**
 * Parse the raw argument string of `/at`.
 *
 * Grammar: `<HH:MM|HH.MM|HH> [message...]`. An empty input or `help` shows
 * usage. The remainder after the time is the message (defaulting to
 * `defaultMessage`). Listing and cancelling go through `/kg`, which shares the
 * same scheduler.
 */
export function parseAtCommand(args: string, defaultMessage: string): AtCommand {
  const trimmed = args.trim();
  if (trimmed === "") return { kind: "help" };

  const [first, ...rest] = trimmed.split(/\s+/);
  if (first.toLowerCase() === "help") return { kind: "help" };

  const time = parseClockTime(first);
  if (time === null) {
    return {
      kind: "error",
      reason: `Invalid time "${first}". Use e.g. 20:00, 20.00, or 20.`,
    };
  }
  const message = rest.join(" ").trim() || defaultMessage;
  return { kind: "schedule", time, message };
}
