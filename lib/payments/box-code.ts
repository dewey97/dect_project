// Box activation codes: format, normalization and hashing.
// Pure module, shared by the redeem API, the generator script and unit tests.
import { createHash, randomInt } from "node:crypto";

// No 0/O/1/I/L: easy to read off a printed card.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const GROUP = 4;
const GROUPS = 3;

/** Uppercase, letters and digits only. "abcd-efgh 2345" -> "ABCDEFGH2345". */
export function normalizeBoxCode(raw: unknown): string {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function isWellFormedBoxCode(normalized: string): boolean {
  return (
    normalized.length === GROUP * GROUPS &&
    [...normalized].every((ch) => ALPHABET.includes(ch))
  );
}

/** sha256 hex of the normalized code. Only this is stored in box_codes. */
export function hashBoxCode(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex");
}

/** Random code, printed as XXXX-XXXX-XXXX (31^12, about 8e17 combinations). */
export function generateBoxCode(): string {
  let out = "";
  for (let i = 0; i < GROUP * GROUPS; i++) {
    if (i > 0 && i % GROUP === 0) out += "-";
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}
