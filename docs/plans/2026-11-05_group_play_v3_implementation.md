# Kế hoạch triển khai: Chơi nhóm v3 (ROADMAP #14)

> **Trạng thái:** Đã duyệt 2026-11-05, kể cả D1–D7 theo đề xuất. P1 đã commit (chờ chạy migration 51). P2 đã viết (chưa smoke test, cần migration 51). P3–P7 chưa làm.
> **Spec gốc:** [`architecture/group_play_realtime.md`](../architecture/group_play_realtime.md) (chốt 2026-11-05). Kế hoạch này không thay đổi spec, trừ các điểm ghi ở mục 2 (cần duyệt).
> **Ngoài phạm vi:** hệ thống điểm và bảng xếp hạng (Q2, Q8b ở mục 9.2 của spec, ROADMAP #15). Chơi nhóm bản online (Q11). Live cursor (#12) làm sau, kế hoạch này chỉ giữ tương thích.
> **Không đụng:** `components/admin/checkpoint-studio/**`, `components/investigation/board/canvas/pin-builder.ts` (session khác đang sửa).

---

## 1. Hiện trạng đã khảo sát

| Điểm                                                                                                                                                                                                      | Vị trí                                                                    |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| Toàn bộ logic phòng nằm trong một provider client, đọc/ghi `game_rooms` bằng anon key                                                                                                                     | `components/investigation/room-sync-context.tsx` (884 dòng)               |
| Kênh realtime `room:${code}`, presence key = `deviceId`, presence gửi `email`, `userId`                                                                                                                   | `room-sync-context.tsx:478`, `:617`                                       |
| Gõ mã không tồn tại thì `insert` phòng mới                                                                                                                                                                | `room-sync-context.tsx:441`                                               |
| Ghi đè cả `state_json` từ client, catch-up không so version, nghe `postgres_changes` (cần anon đọc bảng)                                                                                                  | `room-sync-context.tsx:583`, `:727`, `:748`                               |
| Mã phòng sinh ở client bằng `Math.random`                                                                                                                                                                 | `components/investigation/room-modal.tsx:57`                              |
| 12 consumer chỉ dùng `roomCode`, `roomState`, `syncUpdate`, `broadcastPing`, `activePing`, `nickname`, `members`                                                                                          | `use-investigation-state.ts`, `checkpoints-context.tsx`, `dossier-*`, ... |
| Bảng `game_rooms` không có migration trong `db/schema/`. Cột đang dùng: `room_code`, `game_id`, `state_json`, `last_action`, `created_at`, `updated_at`. Chưa rõ có cột `id` / khóa chính nào             | `docs/architecture/database_schema.md:79`                                 |
| Game hiện vào qua `/evidence/web?case_id=...`. Intro = `PhaseUnlockedModal` (monologue phase 0 + tài liệu ban đầu). Kết luận = `IndictmentModal` (chấm qua `/api/checkpoints/verify`) rồi `EpilogueModal` | `app/(investigation)/evidence/web/page.tsx:821-860`                       |
| Có sẵn: `createAdminClient()` (service role), rate limiter in-memory theo IP                                                                                                                              | `lib/supabase/admin.ts`, `lib/security/rate-limiter.ts`                   |
| Không có test runner unit. Node 24.19 chạy được `node --test` với file `.ts` (type stripping), không cần thêm thư viện                                                                                    | —                                                                         |

Supabase MCP đang `Unauthorized`, nên chưa đọc được schema thật của `game_rooms`. Migration 51 tự đọc catalog nên không cần biết trước (mục 4, P1).

---

## 2. Quyết định cần chủ dự án duyệt

| #   | Vấn đề                                                                                                                                  | Đề xuất                                                                                                                                                                                                                                                                                                                                               |
| :-- | :-------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Spec 3: "Host offline quá 60 giây thì **server** tự chuyển quyền". Server không thấy Supabase Presence, nên không tự biết Host offline. | Thêm cột `room_participants.last_seen_at`, client gửi heartbeat 30 giây/lần (gộp vào `GET /api/rooms/state`). Khi Host vắng presence 60 giây, thành viên online vào sớm nhất gọi `POST /api/rooms/host {action:"claim"}`. Server chỉ chấp nhận nếu `last_seen_at` của Host cũ hơn 60 giây. Lệch spec 4.2 ("không ghi online vào bảng"), cần sửa spec. |
| D2  | QR động cần sinh ảnh QR.                                                                                                                | Thêm 1 dependency `qrcode` (không phụ thuộc phụ, render SVG ở client). Phương án không thêm thư viện: chỉ hiển thị mã to + nút chia sẻ, QR làm sau.                                                                                                                                                                                                   |
| D3  | Nội dung `intro_scene` (ảnh hiện trường, đoạn mở đầu, voice người báo án) chưa có trường riêng trong Studio.                            | Bản đầu dùng lại dữ liệu đang có: monologue phase 0 (`useCaseNarratives`) + ảnh bìa vụ án. `intro_handover` dùng lại nội dung `PhaseUnlockedModal` (tài liệu ban đầu). Trường riêng trong Studio (ảnh, voice) làm việc sau, ghi vào `TECHDEBT.md`.                                                                                                    |
| D4  | Các dòng `game_rooms` của v1 không có participant, client v3 không vào lại được.                                                        | Migration chuyển chúng sang `status = 'dormant'`, `room_code = NULL`, `max_players = 6`, `phase = 'investigating'`. Giữ nguyên `state_json`. Không xóa.                                                                                                                                                                                               |
| D5  | `RoomModal` hiện cho tạo/vào phòng ngay trong màn điều tra.                                                                             | Bỏ form tạo/vào trong `RoomModal`. Khi chưa ở phòng, nút "Chơi nhóm" dẫn tới `/play/<case_id>`. Khi đã ở phòng, modal chỉ hiện mã, QR, thành viên, Rời phòng.                                                                                                                                                                                         |
| D6  | Kênh realtime là public channel. Ai biết `room_id` (UUID) thì nghe được.                                                                | Chấp nhận ở bản này: `room_id` chỉ trả cho participant, mọi thao tác ghi vẫn qua server. Private channel cần JWT cho người chơi ẩn danh, ghi vào `TECHDEBT.md`.                                                                                                                                                                                       |
| D7  | Tiến trình gửi lên `/api/rooms/progress` không được chấm lại trên server (client vẫn có thể gửi `completedCheckpoints` tùy ý).          | Chấp nhận: chỉ ảnh hưởng phòng của chính người gian lận, và chưa có xếp hạng. Khi làm #15 (điểm, xếp hạng) thì `progress` phải nhận kết quả chấm từ `/api/checkpoints/verify` phía server. Ghi vào `TECHDEBT.md`.                                                                                                                                     |

---

## 3. Kiến trúc tóm tắt

```
Client (RoomSyncProvider v3)                     Server (Route Handlers, service role)        Supabase
────────────────────────────                     ─────────────────────────────────────        ────────
localStorage dect_room_sessions                  lib/rooms/*  (logic thuần, có test)
  { roomId: { token, code, caseId, nickname } }
POST /api/rooms/* (Authorization: Bearer token) ─► kiểm token (sha256) + phòng + kicked ──► game_rooms / room_participants / room_events
                                                   ghi DB (CAS theo version / RPC)            (RLS bật, anon không có policy)
                                                   broadcast REST ───────────────────────────► Realtime topic room:<id>
channel room:<id> ◄──────────────────────────────────────────────────────────────────────────┘
  presence { pid, nickname, readPhase }   (không email, không userId)
  broadcast từ client: chỉ DETECTIVE_PING (và CURSOR của #12 sau này)
GET /api/rooms/state khi visibilitychange/online: nạp lại nếu serverVersion > localVersion
```

- **Mã phòng:** Crockford Base32 4 ký tự (`0-9A-Z` bỏ `I L O U`). Chuẩn hóa input: `O→0`, `I/L→1`. Sinh ở server, `INSERT` thử tối đa 5 lần với unique index `WHERE status = 'active'`.
- **Token:** 32 byte ngẫu nhiên (`crypto.randomBytes`), base64url. DB lưu `sha256`. Client lưu token gốc.
- **Ghi tiến trình không race:** server đọc `state_json` + `version`, merge bằng `mergeRoomState()` (TS thuần), rồi `UPDATE ... WHERE id = $1 AND version = $v`. Lệch version thì đọc lại và thử lại, tối đa 3 lần. Luật merge: mảng hợp (union); `phoneInputs`, `annotations` gộp theo key; boolean chỉ chuyển `false → true`; `solvedCulprit` ghi một lần; `teamNotes`, `canvasNotes` last-write-wins (giữ hành vi hiện tại, ghi chú trong `TECHDEBT.md`).
- **Join có giới hạn chỗ:** RPC `room_join(...)` (plpgsql, `SELECT ... FOR UPDATE` trên dòng phòng, đếm chỗ, xử lý trùng nickname bằng hậu tố ` 2`, ` 3`). Chỉ `service_role` được `EXECUTE`.
- **Chuyển phase và nộp kết luận:** `UPDATE game_rooms SET phase = $next ... WHERE id = $1 AND phase = $expected RETURNING *`. Không có dòng trả về nghĩa là đã có người làm trước (409).
- **Tương thích live cursor (#12):** context xuất thêm `roomId` và `channel` (read-only) để `CursorTransport` dùng lại kênh. Presence key = `participantId`.

---

## 4. Các phase triển khai

Mỗi phase: viết test trước cho phần logic thuần, code, chạy `pnpm lint` một lần ở cuối phase, báo cáo, chờ lệnh commit. Không push.

### P1 — Migration DB (đã viết 2026-11-05, chờ chạy)

Tách 2 file để không làm hỏng chơi nhóm v1 đang chạy production:

- **`db/schema/51_group_play_v3_tables.sql`** (chạy ngay được, code v1 vẫn chạy):
  - Không giả định khóa chính hiện tại của `game_rooms` (MCP chưa đọc được schema): đọc catalog, thêm `id` nếu thiếu, thay PK hoặc unique trên `room_code` bằng `PK(id)`. Nếu bảng khác có FK tới `game_rooms(room_code)` thì transaction rollback, không mất gì.
  - Thêm cột `mode`, `status`, `phase`, `phase_changed_at`, `max_players` (default 6 tạm thời cho insert của v1), `host_participant_id`, `started_at`, `ended_at`, `last_activity_at`, `version` + CHECK. Dòng v1 hiện có chuyển `phase = 'investigating'`. Mã trùng giữa các phòng active: giữ dòng mới nhất, giải phóng mã các dòng còn lại. Thêm `idx_game_rooms_active_code`.
  - Bảng `room_participants` (có `last_seen_at`, D1), `room_events`, FK `host_participant_id`. RLS bật, chỉ admin đọc.
  - RPC `room_create`, `room_join` (khóa dòng phòng, kiểm số chỗ, nhận lại participant theo token, hậu tố nickname qua `room_pick_nickname`), `room_lifecycle_sweep`. Chỉ `service_role` được `EXECUTE`. Lịch `pg_cron` để dạng comment.
- **`db/schema/52_group_play_v3_lock_rls.sql`** (chỉ chạy **sau khi** client v3 đã deploy): bật RLS `game_rooms`, xóa mọi policy cũ, thu quyền `anon`/`authenticated`, admin đọc; chuyển phòng v1 (không có Host) sang `dormant`, `room_code = NULL` (D4); bỏ default `max_players`.
- `lib/types/room.ts`: thêm `RoomPhase`, `ROOM_PHASES`, `RoomStatus`, `RoomMode`, `GameRoomRow` mới, `RoomParticipantRow`, `RoomEventRow`, `RoomEventType`. Việc bỏ `email`/`userId` khỏi `RoomMember` dời sang P3 (cùng lúc sửa presence và `RoomModal`).
- **Kiểm chứng:** chủ dự án chạy 51 trên Supabase SQL Editor, chạy các câu kiểm tra ở cuối file. P2 cần 51 đã chạy để test thật.

### P2 — Logic server và API `/api/rooms/*` (đã viết 2026-11-05)

- Logic thuần, không import alias, test bằng `pnpm test:unit` (`node --test`, 14 test): `lib/rooms/code.ts` (Crockford, chuẩn hóa O→0, I/L→1), `merge.ts` (`sanitizeProgressPatch`, `mergeRoomState`, `normalizeRoomState`, `progressDelta`), `phase.ts`, `nickname.ts`, `join-guard.ts` (10 lần sai / 5 phút / IP, chặn 5 phút), `host.ts` (`pickSuccessor`, `autoHostCandidate`), `messages.ts` (text thông báo sinh ở server). `tsconfig.json` thêm `allowImportingTsExtensions` để file test import `./x.ts`.
- `lib/rooms/server.ts` (server-only): token (32 byte, DB lưu sha256), `requireParticipant` qua `Authorization: Bearer`, `updateRoomCas` (ghi kèm điều kiện `version`, thử lại tối đa 4 lần), `reactivateWithNewCode`, snapshot public (không `token_hash`), `addEvents`, `broadcastRoom` (Realtime REST `/realtime/v1/api/broadcast`, topic `room:<id>`, lỗi broadcast không làm hỏng request).
- Type public trong `lib/types/room.ts`: `PublicRoom`, `PublicParticipant`, `PublicRoomEvent`, `RoomSnapshot`, `RoomBroadcastPayload`.
- 10 route (`dynamic = 'force-dynamic'`, `Cache-Control: no-store`): `create`, `join`, `enter`, `reconnect`, `leave`, `phase`, `host` (`transfer`, `kick`, `max_players`, `claim`), `progress`, `conclusion`, `state`. Khác spec 5.1: `GET /api/rooms/state` xác thực bằng token, không nhận `?code=` (mã đổi khi phòng kích hoạt lại); nhận `?since=<eventId>`.
- **Kiểm chứng:** unit test pass, `pnpm lint` pass. Smoke `node scripts/ops/rooms-smoke.mjs` (create → mã sai 404 → join + hậu tố nickname → quyền Host → phase → người vào muộn → đủ người → 3 ghi tiến trình song song không mất dữ liệu → 2 kết luận cùng lúc chỉ nhận 1 → mã cũ hết hiệu lực) **chưa chạy**: cần migration 51 trên Supabase và `SUPABASE_SERVICE_ROLE_KEY` ở dev server.

### P3 — Viết lại `RoomSyncProvider` (client)

- Giữ nguyên chữ ký các field consumer đang dùng (`roomCode`, `roomState`, `syncUpdate`, `broadcastPing`, `activePing`, `nickname`, `members`, `memberCount`, `isConnected`), để 12 consumer không phải sửa.
- Thêm: `roomId`, `phase`, `version`, `participantId`, `isHost`, `hostParticipantId`, `maxPlayers`, `participants` (từ server, gộp trạng thái online từ presence), `events`, `channel`; hành động `createRoom`, `joinRoom` (không bao giờ tự tạo), `reconnect`, `enter`, `leave`, `advancePhase`, `hostAction`, `submitConclusion`, `markRead`.
- `syncUpdate` → `POST /api/rooms/progress` (optimistic update cục bộ, nhận `version` từ server). Bỏ `STATE_PATCH` từ client và `postgres_changes`.
- Nghe broadcast `PHASE_CHANGE`, `PROGRESS_UPDATE`, `MEMBER_UPDATE`, `HOST_CHANGE`, `ROOM_EVENT`; echo guard theo `senderId`; bỏ sự kiện có `version <= localVersion`.
- Presence chỉ gửi `{ pid, nickname, readPhase }`. Xóa `email`, `userId`, `isAuthenticated` (sửa lỗi lộ email).
- Catch-up theo `version` khi `visibilitychange` / `online`; heartbeat nếu duyệt D1.
- Rà soát cách ly Solo: khi có phòng, các consumer không đọc/ghi key Solo (đã có nhánh `roomCode` ở các consumer, kiểm lại từng chỗ).
- Sửa `RoomModal`, `RoomPresenceBar` theo D5. Không còn sinh mã ở client.

### P4 — Màn vào game và phòng chờ (`app/(investigation)/play/[caseId]/page.tsx`)

- Bước theo URL: không tham số / `?mode=box` → màn 2 lựa chọn **[Tạo phòng]** (nhập số người tối đa) / **[Vào phòng]** (ô mã 4 ký tự, lỗi rõ ràng: "Không tìm thấy phòng", "Phòng đã đủ người", "Thử lại sau 5 phút"); `?room=<CODE>` → thẳng bước nickname; có phiên cũ trong localStorage → nút **[Tiếp tục phòng cũ]**.
- Nickname 1–20 ký tự, avatar chữ cái đầu + màu.
- Phòng chờ khi `lobby`: danh sách thành viên realtime (avatar, nickname, nhãn Host, chấm online), mã to, QR (D2), nút chia sẻ (Web Share API, fallback copy), **[Rời phòng]**; Host thấy **[Bắt đầu]**, sửa số người tối đa (không thấp hơn số đang có), kick, chuyển quyền.
- Phòng chờ cho người vào muộn (phase khác `lobby`): danh sách người đang chơi, màn hiện tại + thời gian ("Đang điều tra — 25 phút"), nút **[Vào cuộc]**.
- Không `autoFocus`. Touch target ≥ 44px. Phong cách hồ sơ trinh thám theo `docs/design/design_system.md`.
- Landing: CTA chơi vụ án dẫn tới `/play/<case_id>` (chỉ đổi link, không đụng bảng ghim landing).

### P5 — Đồng bộ phase

- `intro_scene` trong `/play/[caseId]`: render ngay bằng nội dung baseline (Zero-Black-Screen), voice tự bấm phát, báo "đã đọc" qua presence `readPhase` khi cuộn hết hoặc bấm phát; Host thấy `3/5 đã đọc` và **[Tiếp tục]**, thành viên thấy "Chờ Host chuyển màn".
- `intro_handover`: nội dung bàn giao (D3), Host **[Tiếp nhận vụ án]** → server ghi `started_at`, chuyển `investigating`.
- `investigating`: client chuyển tới `/evidence/web?case_id=<id>&room=<CODE>` (cùng layout nên provider giữ kết nối). Trong phòng, trang web bỏ qua luồng `intro_seen` của Solo.
- Nộp kết luận: `IndictmentModal` thêm hộp xác nhận "Nộp kết luận sẽ kết thúc vụ án cho cả phòng. Tiếp tục?" khi ở phòng; sau khi chấm đúng, gọi `POST /api/rooms/conclusion`. 409 thì báo "<tên> đã nộp kết luận". Mọi máy nhận `PHASE_CHANGE → epilogue` thì mở `EpilogueModal`. Hành vi khi nộp sai giữ như hiện tại (Q2 chưa chốt).
- F5 ở bất kỳ phase nào: reconnect bằng token, render đúng màn của phòng.

### P6 — Thông báo phòng

- Nguồn: `room_events` (snapshot trong `GET /state` + broadcast `ROOM_EVENT`). Bỏ `state_json.lastAction`.
- Sự kiện: `checkpoint_solved`, `dossier_unlocked`, `phone_solved`, `member_joined`, `member_left`, `member_entered`, `host_changed`, `conclusion_submitted`. Server tự sinh `message` từ nickname của actor, không nhận text tự do từ client.
- Toast góc dưới phải, tối đa 3 cùng lúc. Chuông có số chưa đọc (localStorage theo phòng), bấm thông báo thì phát `investigation-events` tương ứng để mở nội dung (`target_ref`).
- Tick done tại mục liên quan dùng lại state hiện có (`completedCheckpoints`, `unlockedDossiers`).

### P7 — Quyền Host, vòng đời phòng, hardening, E2E, tài liệu

- Tự chuyển quyền Host khi vắng 60 giây (D1). Host cũ quay lại là thành viên thường. Host rời phòng khi còn ở `lobby` và không còn ai thì hủy phòng.
- Rate limit `join` (đã làm ở P2) + giới hạn tần suất `progress` theo token.
- `pnpm lint`, `pnpm build` cục bộ (thay đổi routing).
- E2E `e2e/group-play-v3.spec.ts` (2–3 browser context): tạo phòng → vào bằng mã sai (báo lỗi, không tạo phòng) → vào bằng mã đúng → phòng chờ thấy nhau → Host bắt đầu → `intro_scene` → `intro_handover` → `investigating` → người vào muộn qua phòng chờ, bấm Vào cuộc, thấy tiến trình chung. Dữ liệu test dùng `case_000` và tự dọn phòng sau test.
- Tài liệu: `group_play_realtime.md` (mục 8.2 chuyển sang "đã sửa", cập nhật 4.2 nếu duyệt D1), `database_schema.md` (bỏ dòng "chưa khóa `game_rooms`", thêm 2 bảng), `ROADMAP.md` #14, `TECHDEBT.md` (D3, D6, D7, LWW của `teamNotes`/`canvasNotes`), plan live cursor (#12) cập nhật dòng dẫn chiếu kênh.

---

## 5. Rủi ro và điểm gãy

| Rủi ro                                                                                          | Xử lý                                                                                                    |
| :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Schema thật của `game_rooms` khác giả định (không có `id`, `room_code` là khóa chính)           | Migration 51 đọc catalog và tự xử lý; FK lạ thì rollback                                                 |
| Rate limiter in-memory mất khi container restart, không chia sẻ nếu sau này chạy nhiều instance | Chấp nhận (một container VPS). Ghi `TECHDEBT.md`                                                         |
| Broadcast REST thất bại sau khi DB đã ghi                                                       | Client luôn có catch-up theo `version` khi quay lại tab; thêm catch-up định kỳ 30 giây nếu phòng đang mở |
| Quota Realtime gói Free (100 tin/giây toàn project)                                             | Server chỉ broadcast khi có thay đổi; không broadcast heartbeat                                          |
| E2E cần migration đã chạy trên Supabase thật                                                    | P2–P7 test được khi P1 đã chạy; nếu chưa, chỉ chạy unit test và typecheck                                |
| `syncUpdate` hiện được gọi rất dày khi vẽ annotation / kéo note                                 | Debounce 500 ms ở provider cho `annotations`, `canvasNotes`, `teamNotes`; các field tiến trình gửi ngay  |
