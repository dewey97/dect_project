#!/usr/bin/env node
/**
 * Smoke test cho /api/rooms/* trên một server đang chạy (cần migration 51 và
 * SUPABASE_SERVICE_ROLE_KEY ở server).
 *
 *   node scripts/ops/rooms-smoke.mjs                 # http://localhost:3000, case_000
 *   BASE_URL=http://localhost:3101 CASE_ID=case_000 node scripts/ops/rooms-smoke.mjs
 *
 * Tạo một phòng thật trong DB rồi Host rời phòng ở cuối (phòng đã bắt đầu nên được giữ,
 * sweep sẽ chuyển dormant sau 7 ngày).
 */
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const CASE_ID = process.env.CASE_ID || "case_000";

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}/api/rooms/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-room-client": "smoke",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function step(name) {
  console.log(`- ${name}`);
}

step("create room (Host Vy, max 3)");
const created = await call("POST", "create", {
  body: { caseId: CASE_ID, maxPlayers: 3, nickname: "Vy" },
});
assert.equal(created.status, 201, JSON.stringify(created.json));
const host = created.json.token;
const code = created.json.snapshot.room.code;
assert.match(code, /^[0-9A-HJKMNP-TV-Z]{4}$/);
assert.equal(created.json.snapshot.room.phase, "lobby");
assert.equal(created.json.snapshot.me.isHost, true);

step("join with a wrong code returns 404 and creates nothing");
const wrong = await call("POST", "join", { body: { code: "ZZZZ" === code ? "YYYY" : "ZZZZ", nickname: "X" } });
assert.equal(wrong.status, 404);

step("join with the right code (Vy again: suffix 'Vy 2')");
const j1 = await call("POST", "join", { body: { code: code.toLowerCase(), nickname: "Vy" } });
assert.equal(j1.status, 200, JSON.stringify(j1.json));
assert.equal(j1.json.snapshot.me.nickname, "Vy 2");
const member = j1.json.token;

step("rejoin with the same token keeps the same participant");
const again = await call("POST", "join", { body: { code, nickname: "Other", token: member } });
assert.equal(again.json.snapshot.me.id, j1.json.snapshot.me.id);

step("member cannot change phase");
const notHost = await call("POST", "phase", { token: member, body: { from: "lobby" } });
assert.equal(notHost.status, 403);

step("Host cannot set max below current seats");
const below = await call("POST", "host", { token: host, body: { action: "max_players", maxPlayers: 1 } });
assert.equal(below.status, 400);

step("Host starts: lobby -> intro_scene, everyone entered");
const start = await call("POST", "phase", { token: host, body: { from: "lobby" } });
assert.equal(start.status, 200, JSON.stringify(start.json));
assert.equal(start.json.snapshot.room.phase, "intro_scene");
assert.ok(start.json.snapshot.participants.every((p) => p.enteredAt));

step("double click on the same phase is rejected");
const dbl = await call("POST", "phase", { token: host, body: { from: "lobby" } });
assert.equal(dbl.status, 409);

step("intro_scene -> intro_handover -> investigating sets started_at");
await call("POST", "phase", { token: host, body: { from: "intro_scene" } });
const inv = await call("POST", "phase", { token: host, body: { from: "intro_handover" } });
assert.equal(inv.json.snapshot.room.phase, "investigating");
assert.ok(inv.json.snapshot.room.startedAt);

step("late joiner waits in the room, then enters");
const late = await call("POST", "join", { body: { code, nickname: "Nam" } });
assert.equal(late.status, 200);
assert.equal(late.json.snapshot.me.enteredAt, null);
const entered = await call("POST", "enter", { token: late.json.token });
assert.ok(entered.json.snapshot.me.enteredAt);

step("room full");
const full = await call("POST", "join", { body: { code, nickname: "Lan" } });
assert.equal(full.status, 409);

step("concurrent progress writes do not lose data");
const writes = await Promise.all([
  call("POST", "progress", { token: host, body: { patch: { completedCheckpoints: ["smoke_a"] } } }),
  call("POST", "progress", { token: member, body: { patch: { completedCheckpoints: ["smoke_b"] } } }),
  call("POST", "progress", { token: late.json.token, body: { patch: { unlockedDossiers: ["smoke_d"] } } }),
]);
writes.forEach((w) => assert.equal(w.status, 200, JSON.stringify(w.json)));
const st = await call("GET", "state", { token: member });
assert.deepEqual(
  [...st.json.snapshot.state.completedCheckpoints].sort(),
  ["smoke_a", "smoke_b"],
);
assert.deepEqual(st.json.snapshot.state.unlockedDossiers, ["smoke_d"]);
assert.ok(st.json.snapshot.events.some((e) => e.type === "checkpoint_solved"));

step("client cannot write conclusion fields through progress");
const cheat = await call("POST", "progress", {
  token: member,
  body: { patch: { indictmentSolved: true } },
});
assert.equal(cheat.status, 400);

step("two conclusions at once: only one is accepted");
const [c1, c2] = await Promise.all([
  call("POST", "conclusion", { token: host, body: { culprit: "x" } }),
  call("POST", "conclusion", { token: member, body: { culprit: "y" } }),
]);
const statuses = [c1.status, c2.status].sort();
assert.deepEqual(statuses, [200, 409], JSON.stringify([c1.json, c2.json]));
const done = c1.status === 200 ? c1 : c2;
assert.equal(done.json.snapshot.room.phase, "epilogue");
assert.equal(done.json.snapshot.room.status, "completed");
assert.equal(done.json.snapshot.room.code, null);

step("reconnect after completion still returns the room (read-only)");
const rc = await call("POST", "reconnect", { token: late.json.token });
assert.equal(rc.status, 200);
assert.equal(rc.json.snapshot.room.phase, "epilogue");

step("old code no longer joins");
const gone = await call("POST", "join", { body: { code, nickname: "Lan" } });
assert.equal(gone.status, 404);

console.log(`OK: room ${created.json.snapshot.room.id}`);
