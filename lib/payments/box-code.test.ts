// Unit test box codes. Run: `pnpm test:unit`.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  generateBoxCode,
  hashBoxCode,
  isWellFormedBoxCode,
  normalizeBoxCode,
} from "./box-code.ts";

test("generated codes are well formed after normalization", () => {
  for (let i = 0; i < 50; i++) {
    const code = generateBoxCode();
    assert.match(code, /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    assert.equal(isWellFormedBoxCode(normalizeBoxCode(code)), true);
  }
});

test("normalization ignores case, spaces and dashes", () => {
  assert.equal(normalizeBoxCode(" abcd-efgh 2345 "), "ABCDEFGH2345");
  assert.equal(
    hashBoxCode(normalizeBoxCode("abcd-efgh-2345")),
    hashBoxCode("ABCDEFGH2345"),
  );
});

test("short codes and ambiguous characters are rejected", () => {
  assert.equal(isWellFormedBoxCode("ABCD"), false);
  assert.equal(isWellFormedBoxCode("ABCDEFGH2340"), false); // 0 not in alphabet
});
