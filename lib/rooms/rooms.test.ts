// Unit test cho logic thuần của phòng chơi nhóm. Chạy: `pnpm test:unit`.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  generateRoomCode,
  normalizeRoomCode,
  ROOM_CODE_ALPHABET,
} from "./code.ts";
import { nextPhase, hostCanAdvance, isRoomPhase } from "./phase.ts";
import { cleanNickname, nicknameAvatar } from "./nickname.ts";
import {
  EMPTY_ROOM_STATE,
  mergeRoomState,
  normalizeRoomState,
  progressDelta,
  sanitizeProgressPatch,
} from "./merge.ts";
import { JoinGuard, JOIN_FAIL_LIMIT, JOIN_BLOCK_MS } from "./join-guard.ts";
import { autoHostCandidate, pickSuccessor, type SeatInfo } from "./host.ts";
import { eventMessage } from "./messages.ts";

test("room code: generated codes use the Crockford alphabet", () => {
  let i = 0;
  const code = generateRoomCode((max) => i++ % max);
  assert.equal(code, "0123");
  const last = generateRoomCode((max) => max - 1);
  assert.equal(last, "ZZZZ");
  assert.equal(ROOM_CODE_ALPHABET.length, 32);
  for (const banned of ["I", "L", "O", "U"]) {
    assert.ok(!ROOM_CODE_ALPHABET.includes(banned));
  }
});

test("room code: normalize input", () => {
  assert.equal(normalizeRoomCode(" ab-3k "), "AB3K");
  assert.equal(normalizeRoomCode("o1lI"), "0111");
  assert.equal(normalizeRoomCode("ABC"), null);
  assert.equal(normalizeRoomCode("ABCDE"), null);
  assert.equal(normalizeRoomCode("ABU1"), null);
  assert.equal(normalizeRoomCode(1234), null);
});

test("phase: order and Host rights", () => {
  assert.equal(nextPhase("lobby"), "investigating");
  assert.equal(nextPhase("intro_handover"), "investigating");
  assert.equal(nextPhase("epilogue"), null);
  assert.ok(hostCanAdvance("intro_scene"));
  assert.ok(!hostCanAdvance("investigating"));
  assert.ok(isRoomPhase("lobby"));
  assert.ok(!isRoomPhase("done"));
});

test("nickname: clean and avatar", () => {
  assert.equal(cleanNickname("  Vy   Nguyen "), "Vy Nguyen");
  assert.equal(cleanNickname("   "), null);
  assert.equal(cleanNickname(42), null);
  assert.equal(cleanNickname("a".repeat(30))?.length, 20);
  assert.equal(cleanNickname("Thám tử\u0007"), "Thám tử");
  const a = nicknameAvatar("vy");
  assert.equal(a.initial, "V");
  assert.deepEqual(nicknameAvatar("vy"), a);
});

test("merge: arrays are unioned, never lose concurrent progress", () => {
  const base = normalizeRoomState({ completedCheckpoints: ["cp1"] });
  // Two players solve different checkpoints at the same time. The server applies
  // both patches one after the other (CAS retry): nothing is lost.
  const afterA = mergeRoomState(base, { completedCheckpoints: ["cp2"] });
  const afterB = mergeRoomState(afterA, {
    completedCheckpoints: ["cp3", "cp1"],
  });
  assert.deepEqual(afterB.completedCheckpoints, ["cp1", "cp2", "cp3"]);
  assert.deepEqual(base.completedCheckpoints, ["cp1"], "input not mutated");
});

test("merge: booleans only go false to true, maps merge by key", () => {
  const s1 = mergeRoomState(EMPTY_ROOM_STATE, {
    phoneSolved: true,
    phoneInputs: { pin: "1234" },
    annotations: { doc1: [] },
  });
  const s2 = mergeRoomState(s1, {
    phoneInputs: { pattern: "L" },
    annotations: { doc2: [] },
  });
  assert.equal(s2.phoneSolved, true);
  assert.deepEqual(s2.phoneInputs, { pin: "1234", pattern: "L" });
  assert.deepEqual(Object.keys(s2.annotations ?? {}), ["doc1", "doc2"]);
});

test("merge: drops v1 lastAction", () => {
  const s = mergeRoomState(
    normalizeRoomState({ lastAction: { text: "x", timestamp: 1 } }),
    { teamNotes: "a" },
  );
  assert.equal(s.lastAction, undefined);
  assert.equal(s.teamNotes, "a");
});

test("sanitize: rejects conclusion fields and junk", () => {
  assert.equal(sanitizeProgressPatch(null), null);
  assert.equal(
    sanitizeProgressPatch({ indictmentSolved: true, solvedCulprit: "x" }),
    null,
  );
  assert.equal(sanitizeProgressPatch({ phoneSolved: false }), null);
  const p = sanitizeProgressPatch({
    completedCheckpoints: ["cp1", 5, "", "x".repeat(200)],
    phoneSolved: true,
    unknownKey: 1,
  });
  assert.deepEqual(p, { completedCheckpoints: ["cp1"], phoneSolved: true });
  assert.deepEqual(sanitizeProgressPatch({ teamNotes: "" }), { teamNotes: "" });
});

test("normalize: empty state_json from a new room", () => {
  const s = normalizeRoomState({});
  assert.deepEqual(s.completedCheckpoints, []);
  assert.equal(s.indictmentSolved, false);
  assert.equal(s.solvedCulprit, null);
});

test("progressDelta: reports only new items", () => {
  const before = normalizeRoomState({
    completedCheckpoints: ["a"],
    unlockedDossiers: ["d1"],
  });
  const after = mergeRoomState(before, {
    completedCheckpoints: ["a", "b"],
    unlockedDossiers: ["d1"],
    phoneSolved: true,
  });
  assert.deepEqual(progressDelta(before, after), {
    newCheckpoints: ["b"],
    newDossiers: [],
    phoneJustSolved: true,
  });
});

test("join guard: blocks after 10 failures for 5 minutes", () => {
  const g = new JoinGuard();
  const t0 = 1_000_000;
  for (let i = 0; i < JOIN_FAIL_LIMIT - 1; i++) g.recordFailure("ip", t0 + i);
  assert.equal(g.blockedFor("ip", t0 + 20), 0);
  g.recordFailure("ip", t0 + 20);
  assert.equal(g.blockedFor("ip", t0 + 20), JOIN_BLOCK_MS / 1000);
  assert.equal(g.blockedFor("other", t0 + 20), 0);
  assert.equal(g.blockedFor("ip", t0 + 20 + JOIN_BLOCK_MS), 0);
  // After the block a new window starts.
  g.recordFailure("ip", t0 + 20 + JOIN_BLOCK_MS);
  assert.equal(g.blockedFor("ip", t0 + 21 + JOIN_BLOCK_MS), 0);
});

function seat(
  id: string,
  joinedMin: number,
  lastSeenAgoMs: number,
  now: number,
  extra?: Partial<SeatInfo>,
): SeatInfo {
  return {
    id,
    joined_at: new Date(Date.UTC(2026, 0, 1, 0, joinedMin)).toISOString(),
    left_at: null,
    kicked: false,
    last_seen_at: new Date(now - lastSeenAgoMs).toISOString(),
    ...extra,
  };
}

test("host: successor is the earliest seated member", () => {
  const now = Date.now();
  const ps = [
    seat("host", 0, 0, now),
    seat("late", 5, 0, now),
    seat("early", 1, 0, now, { left_at: "2026-01-01T00:10:00Z" }),
    seat("mid", 3, 0, now),
  ];
  assert.equal(pickSuccessor(ps, "host"), "mid");
  assert.equal(pickSuccessor([seat("host", 0, 0, now)], "host"), null);
});

test("host: auto transfer only when Host offline over 60s", () => {
  const now = Date.now();
  const online = [
    seat("host", 0, 10_000, now),
    seat("a", 1, 0, now),
    seat("b", 2, 0, now),
  ];
  assert.equal(autoHostCandidate(online, "host", now), null);

  const hostAway = [
    seat("host", 0, 61_000, now),
    seat("a", 1, 70_000, now),
    seat("b", 2, 5_000, now),
  ];
  assert.equal(
    autoHostCandidate(hostAway, "host", now),
    "b",
    "a is offline too, b is online",
  );

  const hostLeft = [
    seat("host", 0, 0, now, { left_at: "x" }),
    seat("a", 1, 0, now),
  ];
  assert.equal(autoHostCandidate(hostLeft, "host", now), "a");
});

test("messages: server builds event text", () => {
  assert.equal(eventMessage("member_entered", "Vy"), "Vy vừa vào cuộc");
  assert.equal(
    eventMessage("conclusion_submitted", "Nam"),
    "Nam đã nộp kết luận",
  );
  assert.equal(
    eventMessage("phase_changed", "Vy", { phase: "investigating" }),
    "Phòng chuyển sang: Đang điều tra",
  );
});

// ---------------------------------------------------------------------------
// Không xếp hạng khi cả phòng vắng quá 15 phút (Q12, 2026-11-05)
// ---------------------------------------------------------------------------
import { shouldMarkUnranked, UNRANKED_GAP_MS } from "./ranking.ts";

const T0 = Date.parse("2026-11-05T10:00:00Z");
const iso = (ms: number) => new Date(ms).toISOString();

test("unranked: threshold is 15 minutes", () => {
  assert.equal(UNRANKED_GAP_MS, 15 * 60_000);
});

test("unranked: below the threshold keeps the room ranked", () => {
  const now = T0 + 20 * 60_000;
  assert.equal(
    shouldMarkUnranked({
      startedAt: iso(T0),
      unrankedAt: null,
      lastSeenAt: [iso(now - UNRANKED_GAP_MS + 1_000), iso(T0)],
      now,
    }),
    false,
  );
});

test("unranked: exactly at the threshold keeps the room ranked", () => {
  const now = T0 + 30 * 60_000;
  assert.equal(
    shouldMarkUnranked({
      startedAt: iso(T0),
      unrankedAt: null,
      lastSeenAt: [iso(now - UNRANKED_GAP_MS)],
      now,
    }),
    false,
  );
});

test("unranked: above the threshold marks the room", () => {
  const now = T0 + 30 * 60_000;
  assert.equal(
    shouldMarkUnranked({
      startedAt: iso(T0),
      unrankedAt: null,
      lastSeenAt: [iso(now - UNRANKED_GAP_MS - 1), iso(T0)],
      now,
    }),
    true,
  );
});

test("unranked: already unranked stays as is (no new mark)", () => {
  const now = T0 + 60 * 60_000;
  assert.equal(
    shouldMarkUnranked({
      startedAt: iso(T0),
      unrankedAt: iso(T0 + 20 * 60_000),
      lastSeenAt: [iso(T0)],
      now,
    }),
    false,
  );
});

test("unranked: not started, or no activity data, never marks", () => {
  const now = T0 + 60 * 60_000;
  assert.equal(
    shouldMarkUnranked({ startedAt: null, unrankedAt: null, lastSeenAt: [iso(T0)], now }),
    false,
  );
  // Activity before started_at does not count as a gap: the gap starts at started_at.
  assert.equal(
    shouldMarkUnranked({
      startedAt: iso(now - 5 * 60_000),
      unrankedAt: null,
      lastSeenAt: [iso(T0)],
      now,
    }),
    false,
  );
});
