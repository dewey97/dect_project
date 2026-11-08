# Đặc Tả Hệ Thống Chơi Nhóm Đồng Bộ (Group Play Realtime Specification)

> **Tài liệu Kỹ thuật Tầng 1 (Technical Spec #11)**
> **Trạng thái:** v3 đã implement trên nhánh `claude/group-play-v3-5791c0` (2026-11-05), chờ chạy migration 51/52 và deploy. Điểm số, xếp hạng còn chờ Phần 9.2
> **Cập nhật lần cuối:** 2026-11-05
> **Tài liệu liên quan:** [`license_access.md`](../product/license_access.md), [`license_technical.md`](../product/license_technical.md), [`database_schema.md`](database_schema.md), [`rating_leaderboard.md`](../product/rating_leaderboard.md)

> [!NOTE]
> **Thuật ngữ:** bước cuối của vụ án gọi là **kết luận** (người chơi nộp kết luận: thủ phạm, động cơ, mâu thuẫn). Không dùng từ "cáo trạng". Code, DB và các tài liệu khác hiện vẫn dùng `indictment` / "cáo trạng"; việc đổi tên theo dõi ở [`TECHDEBT.md`](../TECHDEBT.md) #21.

---

## 1. Tổng quan

### 1.1. Bối cảnh

Nhóm người chơi cùng điều tra một vụ án trên nhiều thiết bị cá nhân. Nhóm thường ngồi quanh bộ hộp vật lý (tài liệu mật in trên giấy), hoặc chơi từ xa qua Discord, Meet, Zalo. Web app là công cụ phụ trợ: bẻ khóa điện thoại, nghe audio, nhập đáp án checkpoint, nộp kết luận.

### 1.2. Hai chế độ vào game

| Chế độ                            | Điểm vào                       | Phòng chờ                                |
| :-------------------------------- | :----------------------------- | :--------------------------------------- |
| **Bản hộp vật lý** (`mode = box`) | QR tĩnh in chung trong nắp hộp | **Bắt buộc**, kể cả khi chơi 1 người     |
| **Bản online, chơi solo**         | Tài khoản + license            | **Không qua** phòng chờ, vào thẳng intro |
| **Bản online, chơi nhóm**         | Tài khoản + license            | Chưa thiết kế, để sau (Phần 9, Q11)      |

### 1.3. Nguyên tắc cốt lõi

1. **Vào phòng không rào cản:** không tài khoản, không email, không tải app. Quét QR, nhập nickname, vào phòng.
2. **QR chung, phòng do Host tạo:** mọi hộp in chung một QR tĩnh. QR chỉ mở đúng vụ án. Danh tính phòng do người bấm **[Tạo phòng]** sinh ra. Không chống chép bằng mã riêng từng hộp (lý do ở [`license_technical.md`](../product/license_technical.md) mục 1.1).
3. **Cách ly Solo và Room:** phòng mới luôn bắt đầu từ 0%. Vào phòng không đọc, không ghi savegame Solo.
4. **Tiến trình chung, góc nhìn riêng:**
   - Đồng bộ chung: phase màn hình, checkpoint đã giải, điện thoại đã mở, hồ sơ đã mở khóa, kết luận.
   - Độc lập riêng: tài liệu đang đọc, vị trí cuộn, zoom, xem lại lịch sử, phát voice.
5. **Host điều nhịp, ai cũng điều tra:** chỉ Host chuyển các màn dẫn truyện (intro). Trong gameplay, mọi thành viên đều giải được checkpoint và nộp được kết luận.
6. **Bố cục do Game Master định hình:** người chơi không kéo thả ghim trên bảng điều tra.

---

## 2. Luồng người chơi

### 2.1. Sơ đồ phase của phòng

```
[Landing] ──chọn vụ──► [Màn vào game] ──Tạo / Vào──► [Nickname] ──► [Phòng chờ]
                                                                       │
                    ┌──────────────────────────────────────────────────┘
                    ▼
   lobby ──Host: Bắt đầu──► intro_scene ──Host: Tiếp tục──► intro_handover
                                                               │
                                          Host: Tiếp nhận vụ án│ (bắt đầu tính giờ)
                                                               ▼
                       epilogue ◄──nộp kết luận── investigating
```

- **Phase là trạng thái của phòng**, lưu trên server. Mọi thiết bị đã vào cuộc render theo phase hiện tại.
- F5 hoặc mất mạng: client đọc lại phase từ server, quay về đúng màn của phòng.
- Vòng đời lưu trữ của phòng (`status`) tách riêng với phase, xem Phần 6.

### 2.2. Giai đoạn 1 — Landing Page (cá nhân)

- Ai cũng vào tự do, không đồng bộ với ai.
- Hiển thị danh sách vụ án: độ khó, độ kinh dị, thời lượng dự kiến, số người khuyến nghị.
- Bấm vào một vụ án: chuyển sang trang vụ án `/cases/<case_id>` (mua bản online, đặt hộp, kích hoạt mã hộp, trạng thái sở hữu), rồi mới vào màn vào game.
- Người quét QR trên hộp **bỏ qua landing**, vào trang vụ án với mã hộp điền sẵn.

> Cập nhật 2026-11-06 (sở hữu và chặn vào game): khi bật `PLAY_GATING_ENABLED`, Host phải sở hữu vụ án (mua online hoặc kích hoạt mã hộp, cần đăng nhập). Người vào phòng qua mã/QR phòng không cần mua và không cần tài khoản. Có hộp: tạo phòng miễn phí; chỉ có bản online: trừ 1 lượt nhóm mỗi phòng. Chi tiết: [`plans/2026-11-05_payment_checkout.md`](../plans/2026-11-05_payment_checkout.md) mục Flow.

### 2.3. Giai đoạn 2 — Màn vào game

**Điểm vào:**

- QR tĩnh trong nắp hộp: `https://<domain>/play/<case_id>?mode=box`.
- Hoặc từ landing.

**Màn hình có 2 lựa chọn:**

| Lựa chọn        | Hành vi                                                                                                                                                                                           |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[Tạo phòng]** | Người bấm trở thành Host. Host đặt **số người tối đa** của phòng. Server sinh mã phòng 4 ký tự và QR động. Gợi ý dưới nút: _"Chỉ 1 người trong nhóm tạo phòng, những người khác chọn Vào phòng."_ |
| **[Vào phòng]** | Ô nhập mã 4 ký tự. Mã sai hoặc phòng không tồn tại thì báo lỗi, **không bao giờ tự tạo phòng mới**.                                                                                               |

**Số người tối đa:**

- Host bắt buộc đặt khi tạo phòng. Hệ thống không có giới hạn chung.
- Host sửa được trong phòng chờ, nhưng không thấp hơn số người đang có trong phòng.
- Phòng đủ người thì từ chối người mới, báo _"Phòng đã đủ người"_.

**QR động của phòng:**

- Hiển thị trên phòng chờ của Host (và của mọi thành viên, để mời thêm người), kèm mã to và nút chia sẻ link.
- Link dạng `https://<domain>/play/<case_id>?room=<CODE>`. Quét vào là đi thẳng tới bước nhập nickname, bỏ qua màn 2 lựa chọn.
- Route của luồng chơi (xem `lib/play/routes.ts`):
  - `/play/<case_id>`: vào game (chơi một mình, tạo phòng, nhập mã). Link mời trỏ vào đây.
  - `/play/<case_id>/lobby?room=<CODE>`: phòng chờ và intro đồng bộ. Thiết bị chưa có phiên của mã thì về `/play/<case_id>?room=<CODE>` để nhập tên.
  - `/play/<case_id>/board?room=<CODE>`: bàn điều tra. Phòng chưa vào `investigating` hoặc người chơi chưa vào cuộc thì về `/lobby`.
  - Không còn màn loading riêng trước bàn điều tra: cổng vào là nút ở `/play` hoặc phòng chờ; bàn hiện ngay, phần đang tải hiện dòng trạng thái nhỏ.

**Nickname:**

- Bắt buộc, 1–20 ký tự. Trùng tên trong phòng thì server tự thêm hậu tố (`Vy 2`).
- Avatar tự sinh từ nickname (chữ cái đầu + màu), không upload.

**Giới hạn nhập mã sai:**

- Rate limit theo IP: tối đa 10 lần sai trong 5 phút, sau đó chờ 5 phút. Lý do: mã 4 ký tự có khoảng 920 nghìn tổ hợp, đoán mò được nếu không giới hạn.
- Không khóa mã phòng khi bị nhập sai, tránh người khác cố tình làm khóa phòng.

### 2.4. Giai đoạn 3 — Phòng chờ

Mọi người chơi bản hộp đều đi qua phòng chờ, kể cả khi chơi 1 người hoặc vào muộn.

**Khi phòng đang ở `lobby`:**

- Danh sách thành viên realtime: avatar, nickname, nhãn Host, trạng thái online (Supabase Presence).
- Nút Sẵn sàng **không** có. Host bấm **[Bắt đầu]** lúc nào cũng được, cả phòng chuyển sang `intro_scene` cùng lúc.

**Khi phòng đã bắt đầu (người vào muộn):**

- Người mới vẫn vào phòng chờ trước. Phòng chờ hiển thị:
  - Danh sách người **đang chơi**, kèm màn hiện tại của phòng (ví dụ _"Đang điều tra — 25 phút"_).
  - Nút **[Vào cuộc]**. Bấm vào thì đi thẳng tới phase hiện tại của phòng, thấy toàn bộ tiến trình chung đã có.
- Cả phòng nhận thông báo _"Vy vừa vào cuộc"_.

**Mọi lúc:**

- Mọi người có nút **[Rời phòng]**.
- Chỉ Host thấy: sửa số người tối đa, kick thành viên, chuyển quyền Host.
- Host rời phòng khi chưa có ai khác: phòng bị hủy (chỉ khi còn ở `lobby`).

**Ra vào tự do:**

- **Rời phòng** (bấm nút): giải phóng chỗ. Quay lại thì vào như người mới, nếu phòng còn chỗ. Server nhận lại đúng nickname cũ nhờ token trên thiết bị.
- **Mất kết nối** (tắt màn hình, mất mạng, F5): vẫn giữ chỗ. Mở lại là tự kết nối, không phải nhập lại gì.

### 2.5. Giai đoạn 4.1 — Cảnh mở đầu (`intro_scene`)

- Ảnh hiện trường, đoạn mở đầu, voice người báo án.
- Voice: người chơi tự bấm phát trên máy mình (trình duyệt mobile chặn autoplay). Không tự phát.
- Mỗi máy báo "đã đọc" khi người chơi cuộn hết nội dung hoặc bấm phát voice. Host thấy chỉ báo `3/5 đã đọc`.
- Chỉ Host có **[Tiếp tục]**. Thành viên thấy dòng _"Chờ Host chuyển màn"_.
- Màn render ngay khi đổi phase, dùng nội dung đã cache. Không render màn trống trong lúc chờ Supabase (quy tắc Zero-Black-Screen ở `AGENTS.md`).

### 2.6. Giai đoạn 4.2 — Bàn giao hồ sơ (`intro_handover`)

- Hồ sơ bàn giao, thông tin ban đầu, nhiệm vụ điều tra. Mỗi người xem độc lập.
- Chỉ Host có **[Tiếp nhận vụ án]**. Bấm xong:
  - Server ghi `started_at`. Đây là mốc bắt đầu tính giờ.
  - Cả phòng chuyển sang `investigating`.

### 2.7. Giai đoạn 5 — Điều tra (`investigating`)

- **Tiến trình chung:** thành viên nào giải đúng checkpoint thì cả phòng mở khóa nội dung tương ứng.
- **Nghiên cứu tự do:** ai cũng xem lại tài liệu cũ qua lịch sử, không ảnh hưởng người khác.
- **Thông báo:**
  - Có sự kiện: tick done tại mục liên quan, cộng toast ở góc dưới bên phải.
  - Icon chuông chứa danh sách mọi thông báo của phòng, có số chưa đọc.
  - Bấm vào một thông báo: mở thẳng nội dung tương ứng.
  - Số chưa đọc lưu theo từng thiết bị (localStorage).
  - Phòng đông: tối đa 3 toast cùng lúc, toast thừa chỉ vào chuông.
- **Sự kiện tạo thông báo:** giải checkpoint, mở khóa hồ sơ, bẻ khóa điện thoại, thành viên vào hoặc rời phòng, chuyển quyền Host, nộp kết luận.
- **Chỉ điểm tài liệu (giữ từ spec cũ):** thành viên bấm **[Chỉ điểm]** trên thẻ tài liệu hoặc vật chứng. Máy đồng đội hiện badge _"Nam đang chỉ điểm văn bản này"_ trên thẻ đó và cuộn danh mục tới thẻ. Không áp dụng lên bảng ghim.
- **Nộp kết luận:**
  - **Mọi thành viên** đều nộp được.
  - Bắt buộc hộp xác nhận: _"Nộp kết luận sẽ kết thúc vụ án cho cả phòng. Tiếp tục?"_.
  - Hai người nộp gần cùng lúc: server chỉ nhận bản đến trước (khóa theo phase: chỉ chấp nhận khi phòng còn ở `investigating`). Bản sau nhận thông báo _"Nam đã nộp kết luận"_.
  - Nộp sai thì sao: phụ thuộc hệ thống điểm, xem Phần 9 (Q2).

### 2.8. Giai đoạn 6 — Hậu truyện (`epilogue`)

- Mọi máy cùng chuyển sang kết quả, đáp án, epilogue.
- Server ghi `ended_at`, tính thời gian hoàn thành, ghi bảng xếp hạng (Phần 7).
- Người chơi vẫn xem lại hồ sơ được. Phòng chuyển `status = completed` và được lưu lại (Phần 6).

---

## 3. Quyền Host

| Hành động                                                    | Host | Thành viên |
| :----------------------------------------------------------- | :--: | :--------: |
| Bắt đầu game, chuyển màn intro, tiếp nhận vụ án              |  ✓   |            |
| Sửa số người tối đa, kick thành viên, chuyển quyền Host      |  ✓   |            |
| Giải checkpoint, bẻ khóa điện thoại, ghi chú chung, chỉ điểm |  ✓   |     ✓      |
| Nộp kết luận                                                 |  ✓   |     ✓      |

**Chuyển quyền khi Host vắng mặt:**

- Host chủ động chuyển cho thành viên bất kỳ.
- Host offline (theo Presence) quá 60 giây: server tự chuyển quyền cho thành viên online vào phòng sớm nhất. Thông báo cho cả phòng.
- Host cũ quay lại: là thành viên thường, không tự lấy lại quyền.

---

## 4. Cơ sở dữ liệu

### 4.1. Bảng `game_rooms` (thêm cột)

```sql
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(4),                          -- Crockford Base32. NULL khi phòng không còn active (mã được giải phóng)
  game_id VARCHAR(50) NOT NULL,

  -- Mới
  mode VARCHAR(10) NOT NULL DEFAULT 'box',       -- 'box' | 'online'
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active' | 'dormant' | 'completed' (Phần 6)
  phase VARCHAR(20) NOT NULL DEFAULT 'lobby',    -- lobby | intro_scene | intro_handover | investigating | epilogue
  phase_changed_at TIMESTAMPTZ DEFAULT NOW(),
  max_players SMALLINT NOT NULL CHECK (max_players >= 1),
  host_participant_id UUID,                      -- FK room_participants(id)
  started_at TIMESTAMPTZ,                        -- Host bấm Tiếp nhận vụ án
  ended_at TIMESTAMPTZ,                          -- nộp kết luận
  unranked_at TIMESTAMPTZ,                       -- Q12: cả phòng vắng quá 15 phút sau started_at. Ghi một lần, không gỡ
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  state_json JSONB NOT NULL DEFAULT '{}'::jsonb, -- tiến trình điều tra (mục 4.4)
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_rooms_active_code
ON game_rooms(room_code) WHERE status = 'active';
```

Sinh mã: server thử `INSERT` với mã ngẫu nhiên. Nếu vi phạm unique index thì sinh mã khác, tối đa 5 lần. Không cần Redis hay khóa phân tán.

### 4.2. Bảng `room_participants` (mới)

```sql
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(20) NOT NULL,
  token_hash TEXT NOT NULL,          -- hash của participant token, token gốc chỉ lưu ở client
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- lần gọi API có token cuối cùng (tự chuyển Host, Q12)
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  entered_at TIMESTAMPTZ,            -- bấm Vào cuộc (hoặc Host bấm Bắt đầu khi đang ở lobby). NULL = còn ở phòng chờ
  left_at TIMESTAMPTZ,               -- bấm Rời phòng. NULL = đang giữ chỗ
  kicked BOOLEAN DEFAULT false,
  UNIQUE (room_id, nickname)
);
```

- Số chỗ đã dùng = số dòng có `left_at IS NULL AND kicked = false`. Server kiểm tra với `max_players` trong cùng transaction khi join.
- Trạng thái online hiển thị lấy từ Supabase Presence. Server không thấy Presence nên dùng `last_seen_at` (heartbeat qua mọi route có token) cho hai việc: tự chuyển Host khi vắng 60 giây và quy tắc Q12.

### 4.3. Bảng `room_events` (mới)

Phục vụ danh sách thông báo và bấm chuyển nhanh. Thay cho `state_json.lastAction` (chỉ giữ được 1 sự kiện).

```sql
CREATE TABLE room_events (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  actor_participant_id UUID REFERENCES room_participants(id),
  type VARCHAR(40) NOT NULL,         -- checkpoint_solved | dossier_unlocked | phone_solved | member_joined | host_changed | conclusion_submitted ...
  target_ref TEXT,                   -- id nội dung để mở nhanh (checkpoint id, dossier id ...)
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_room_events_room ON room_events(room_id, id);
```

### 4.4. `state_json`

Giữ cấu trúc `RoomInvestigationState` hiện tại (`phoneSolved`, `completedCheckpoints`, `unlockedDossiers`, `teamNotes`, ...). Bỏ `lastAction` sau khi `room_events` chạy. Field `indictmentSolved` đổi tên theo [`TECHDEBT.md`](../TECHDEBT.md) #21.

---

## 5. API và giao thức đồng bộ

### 5.1. Route Handlers

Mọi thao tác ghi đi qua server, xác thực bằng participant token. Client không ghi trực tiếp `game_rooms`.

| Route                         | Ai gọi      | Tác dụng                                                                                                                                                 |
| :---------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/rooms/create`      | bất kỳ      | Tạo phòng với `max_players`, tạo participant Host, trả token + mã                                                                                        |
| `POST /api/rooms/join`        | bất kỳ      | Kiểm tra mã, rate limit, số chỗ. Tạo participant, trả token. Mã không tồn tại thì trả 404                                                                |
| `POST /api/rooms/enter`       | participant | Bấm Vào cuộc (người vào muộn), ghi `entered_at`                                                                                                          |
| `POST /api/rooms/reconnect`   | participant | Nhận lại đúng người cũ bằng token, không tạo nickname mới. Phòng `dormant` thì kích hoạt lại (Phần 6)                                                    |
| `POST /api/rooms/leave`       | participant | Rời phòng, giải phóng chỗ. Host rời thì chuyển quyền hoặc hủy phòng trống                                                                                |
| `POST /api/rooms/phase`       | Host        | Chuyển phase. Chỉ cho phép chuyển tới phase kế tiếp                                                                                                      |
| `POST /api/rooms/host`        | Host        | Chuyển quyền Host, kick thành viên, sửa `max_players`                                                                                                    |
| `POST /api/rooms/progress`    | participant | Ghi tiến trình (merge), ghi `room_events`                                                                                                                |
| `POST /api/rooms/conclusion`  | participant | Nộp kết luận. Chỉ nhận khi phòng ở `investigating`. Chuyển `epilogue`, ghi `ended_at`                                                                    |
| `GET /api/rooms/state?since=` | participant | Snapshot: phase, state, version, thành viên, sự kiện mới hơn `since`. Xác thực bằng token, không cần mã (mã đổi khi phòng kích hoạt lại). Kiêm heartbeat |

Các route đọc dữ liệu động có `export const dynamic = 'force-dynamic'`.

### 5.2. Kênh realtime

- Một kênh mỗi phòng: `room:${room_id}` (dùng id, không dùng mã phòng, vì mã có thể đổi khi phòng được kích hoạt lại).
- Sự kiện broadcast: `PHASE_CHANGE`, `PROGRESS_UPDATE`, `MEMBER_UPDATE`, `HOST_CHANGE`, `ROOM_EVENT`.
- Server broadcast sau khi ghi DB thành công. Payload luôn có `version`.
- Echo guard: bỏ qua sự kiện có `senderId` trùng `clientId` của mình.

### 5.3. Ghi tiến trình chống race condition

Server merge, không ghi đè toàn bộ `state_json`. Mảng (`completedCheckpoints`, `unlockedDossiers`, ...) dùng phép hợp (union). Mỗi lần ghi tăng `version`.

### 5.4. Khôi phục mạng

Khi tab active lại (`visibilitychange`, `online`): gọi `GET /api/rooms/state`. Nếu `serverVersion > localVersion` thì nạp snapshot, gồm cả phase.

---

## 6. Lưu trữ phòng

Phòng được lưu lại, không xóa sau khi chơi xong. Để không tốn tài nguyên, phòng chuyển qua các trạng thái:

| `status`    | Khi nào                                                    | Mã phòng                            | Realtime | Hành vi                                                                                                |
| :---------- | :--------------------------------------------------------- | :---------------------------------- | :------- | :----------------------------------------------------------------------------------------------------- |
| `active`    | Đang chơi hoặc có hoạt động trong 7 ngày                   | Giữ                                 | Bật      | Bình thường                                                                                            |
| `dormant`   | Chưa kết thúc, không có hoạt động 7 ngày                   | **Giải phóng** (`room_code = NULL`) | Tắt      | Tiến trình vẫn lưu đủ. Thiết bị từng chơi bấm **[Tiếp tục phòng cũ]** thì phòng về `active` với mã mới |
| `completed` | Đã nộp kết luận                                            | Giải phóng                          | Tắt      | Chỉ đọc: xem lại hồ sơ, kết quả, xếp hạng                                                              |
| (xóa)       | Phòng ở `lobby`, chưa bắt đầu, không ai online quá 30 phút |                                     |          | Xóa hẳn, là phòng rác                                                                                  |

Phòng `dormant` (7 ngày không hoạt động) đương nhiên đã có `unranked_at` nếu đã bắt đầu tính giờ, vì 7 ngày vượt xa ngưỡng 15 phút ở Phần 7. Hàm dọn dẹp ghi `unranked_at` khi chuyển phòng sang `dormant` nếu chưa có.

**Vì sao phải giải phóng mã phòng:** mã 4 ký tự chỉ có khoảng 920 nghìn tổ hợp. Nếu mọi phòng cũ giữ mã mãi, kho mã cạn dần và sinh mã mới ngày càng hay trùng. Mã chỉ cần cho phòng đang chơi.

**Tiếp tục phòng cũ:** thiết bị lưu danh sách phòng đã tham gia (participant token) trong localStorage. Màn vào game hiển thị **[Tiếp tục phòng cũ]** nếu có.

**Chi phí lưu trữ (ước tính):**

- `state_json`: 5–20 KB mỗi phòng. `room_participants`: không đáng kể.
- `room_events`: khoảng 100–300 dòng mỗi phòng, khoảng 50 KB. Đây là phần nặng nhất.
- Giữ nguyên mọi thứ: khoảng 70 KB mỗi phòng, 10.000 phòng ≈ 700 MB. Vượt gói Free của Supabase (500 MB), còn rất nhỏ so với gói Pro (8 GB).
- Đề xuất: xóa `room_events` sau 30 ngày kể từ khi `completed`. Kết quả, xếp hạng và tiến trình vẫn giữ. Còn khoảng 20 KB mỗi phòng, 10.000 phòng ≈ 200 MB.
- Dọn dẹp chạy bằng job định kỳ (pg_cron trên Supabase hoặc cron trên VPS), mỗi ngày một lần.

---

## 7. Tính giờ và bảng xếp hạng

- Thời gian hoàn thành = `ended_at - started_at`, do server tính. **Không trừ thời gian nghỉ**, kể cả khi phòng chuyển `dormant`.
- Bảng xếp hạng **phân hạng theo số người chơi**. Quy chế đếm số người và các mức phân hạng: xem Phần 9 (Q8).
- Xếp theo điểm trước, thời gian sau, như index `score DESC, completion_time_seconds ASC` trong [`rating_leaderboard.md`](../product/rating_leaderboard.md). Cách tính điểm: xem Phần 9 (Q2).
- Mỗi bản ghi xếp hạng lưu số người chơi của phòng.

### 7.1. Chơi liền một mạch (Q12, chốt 2026-11-05)

- Một phòng chỉ được xếp hạng khi chơi liền một mạch.
- Sau `started_at`, nếu có một khoảng trống **quá 15 phút** mà không participant nào hoạt động, server ghi `game_rooms.unranked_at = now()`. Đánh dấu này vĩnh viễn, không bao giờ gỡ.
- Phòng vẫn chơi tiếp bình thường. Client ẩn đồng hồ và hiện dòng _"Phòng này không còn tính xếp hạng"_. Khi phòng `completed`, server không ghi bảng xếp hạng.
- Áp dụng cho chơi nhóm, solo online và bản hộp.
- **Server tự quyết**, client không tự báo mình online. "Hoạt động" = lần gọi `/api/rooms/*` có token cuối cùng của participant (`room_participants.last_seen_at`). Client gọi `GET /api/rooms/state` mỗi 30 giây khi tab đang hiển thị, kiêm heartbeat.
- Mỗi lần gọi `/api/rooms/*` sau `started_at` (kể cả nộp kết luận và người vào muộn): server đo `now - max(started_at, last_seen_at của mọi participant)` **trước** khi ghi nhận lần hoạt động của người gọi. Quá ngưỡng thì ghi `unranked_at` và broadcast `MEMBER_UPDATE` kèm `room`. Ngưỡng là hằng số `UNRANKED_GAP_MS` (`lib/rooms/ranking.ts`).
- Cảnh báo chính: phòng chờ hoặc intro, trước khi Host bắt đầu: _"Bảng xếp hạng chỉ tính khi chơi liền một mạch. Nếu cả phòng rời quá 15 phút, phòng vẫn chơi tiếp nhưng không xếp hạng."_ Cảnh báo phụ: hộp xác nhận khi người online cuối cùng bấm **[Rời phòng]**. Không dùng `beforeunload` (trình duyệt không cho ghi chữ riêng).
- Màn **[Tiếp tục phòng cũ]** hiện trạng thái không xếp hạng nếu phòng có `unranked_at`.
- **Giới hạn đã biết:** trình duyệt mobile dừng JavaScript khi khóa màn hình hoặc chuyển app. Nhóm chơi bản hộp đọc tài liệu giấy hơn 15 phút mà mọi máy đều khóa màn hình thì phòng mất xếp hạng, dù vẫn đang chơi.

---

## 8. Bảo mật, ngoại lệ và hiện trạng code

### 8.1. Bảo mật

1. **Không ghi trực tiếp từ client:** khóa quyền `INSERT`/`UPDATE` của `anon` trên `game_rooms`, `room_participants`, `room_events`. Đọc qua server route hoặc RLS theo phòng.
2. **Participant token:** sinh ngẫu nhiên, lưu ở localStorage của client, DB chỉ lưu hash. Mọi route ghi đều kiểm tra token thuộc đúng phòng và chưa bị kick.
3. **Cách ly localStorage:** khi ở trong phòng, không đọc hoặc ghi key lưu trữ của chế độ Solo.

### 8.2. Lỗi của bản v1 và cách đã sửa (2026-11-05)

Bản v1 (`room-sync-context.tsx` trước commit `73e810d`) lệch spec ở các điểm dưới. Code v3 trên nhánh `claude/group-play-v3-5791c0` đã sửa; có hiệu lực trên production sau khi chạy migration 51, deploy, rồi chạy migration 52. Kế hoạch và tiến độ: [`plans/2026-11-05_group_play_v3_implementation.md`](../plans/2026-11-05_group_play_v3_implementation.md).

| Lỗi v1                                                          | Đã sửa                                                                                                                          |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| Vào phòng bằng mã không tồn tại thì client **tự tạo phòng mới** | `POST /api/rooms/join` trả 404, không bao giờ tạo phòng; giới hạn 10 lần sai / 5 phút / IP                                      |
| Client ghi thẳng `game_rooms` bằng anon key                     | Mọi thao tác qua `/api/rooms/*` (service role, participant token). Migration 52 bật RLS và thu quyền `anon`/`authenticated`     |
| Ghi đè toàn bộ `state_json` (last write wins)                   | Server merge (`lib/rooms/merge.ts`) và ghi kèm điều kiện `version` (compare-and-swap), thử lại khi lệch                         |
| Không có phase, Host, participant, giới hạn số người            | Cột phase/Host/`max_players`, bảng `room_participants`, `room_events`; phòng chờ, intro đồng bộ, quyền Host ở `/play/<case_id>` |
| Catch-up không so `version`                                     | Client chỉ nạp snapshot khi `version` server lớn hơn, khi tab active lại, có mạng lại và mỗi 30 giây                            |
| Mã phòng sinh ở client bằng `Math.random`                       | Server sinh mã Crockford, unique index `WHERE status = 'active'`, thử tối đa 5 lần                                              |
| Presence gửi `email`, `userId`                                  | Presence chỉ gửi `{ pid, nickname, readPhase }`                                                                                 |
| Đang ở phòng vẫn đọc/ghi savegame Solo                          | `lib/investigation/storage.ts` thêm tiền tố `room:<id>::` cho mọi key khi ở phòng                                                             |
| Thuật ngữ và identifier `indictment` / "cáo trạng"              | Chưa đổi, theo dõi ở [`TECHDEBT.md`](../TECHDEBT.md) #21                                                                        |

## 9. Đã chốt và còn chờ quyết định

### 9.1. Đã chốt (2026-11-05)

| #   | Nội dung                         | Quyết định                                                                                                              |
| :-- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Q1  | Ai được nộp kết luận             | Mọi thành viên, có hộp xác nhận                                                                                         |
| Q3  | Nút Sẵn sàng                     | Bỏ. Host bắt đầu lúc nào cũng được                                                                                      |
| Q4  | Số người mỗi phòng               | Host đặt khi tạo phòng, không vượt quá. Ra vào tự do                                                                    |
| Q5  | Người vào muộn                   | Được vào. Qua phòng chờ, thấy người đang chơi, bấm Vào cuộc                                                             |
| Q6  | Lưu phòng                        | Lưu lại, theo vòng đời ở Phần 6                                                                                         |
| Q7  | Trừ thời gian nghỉ               | Không trừ                                                                                                               |
| Q8  | Phân hạng xếp hạng theo số người | Có (quy chế còn chờ, xem 9.2)                                                                                           |
| Q9  | Voice khi ngồi cùng bàn          | Để sau. Bản đầu: mỗi máy tự phát                                                                                        |
| Q10 | Solo                             | Online solo không qua phòng chờ. Bản hộp luôn qua phòng chờ                                                             |
| Q11 | Bản online chơi nhóm, license    | Để sau                                                                                                                  |
| —   | Thuật ngữ                        | Dùng "kết luận", bỏ "cáo trạng"                                                                                         |
| Q12 | Xếp hạng khi phòng bị bỏ dở      | Cả phòng vắng quá 15 phút sau khi bắt đầu tính giờ thì mất xếp hạng vĩnh viễn, vẫn chơi tiếp (mục 7.1). Chốt 2026-11-05 |

### 9.2. Còn chờ quyết định

**Q2 — Hệ thống điểm theo checkpoint, và nộp kết luận sai.**
Mô hình hiện có trong [`rating_leaderboard.md`](../product/rating_leaderboard.md): khởi điểm 100, trừ điểm khi mở gợi ý (-5 / -15 / -25) và khi đoán sai liên tục (-2 mỗi lần). Mô hình này chưa có điểm riêng cho từng checkpoint. Đề xuất:

- Mỗi checkpoint có trường `points` (cấu hình trong Checkpoint Studio). Kết luận là một checkpoint, thường có điểm cao nhất.
- Điểm tối đa của vụ = tổng `points`. Điểm hiển thị quy về thang 100, để giữ các rank S/A/B/C hiện có.
- Mở gợi ý trừ theo tỷ lệ điểm của chính checkpoint đó (ví dụ mức 1 trừ 20%, mức 2 trừ 50%, mức 3 trừ 100%), thay vì trừ số cố định. Lý do: checkpoint nhỏ không bị trừ nặng hơn giá trị của nó.
- Đoán sai checkpoint: giữ -2 mỗi lần sau lần sai thứ 3, không trừ quá điểm của checkpoint.
- Nộp kết luận sai: cho nộp lại, mỗi lần sai trừ 25% điểm kết luận. Tối đa 3 lần; lần 3 sai thì vào kết cục sai, điểm kết luận = 0.
- Các checkpoint không bắt buộc (nhánh phụ) chỉ cộng điểm, không chặn kết luận.

Cần quyết: chấp nhận mô hình này, hay giữ mô hình trừ điểm cố định từ 100?

**Q8b — Quy chế phân hạng theo số người.**

- Đếm số người thế nào:
  - (a) `max_players` Host đặt. Dễ gian lận: đặt 1 nhưng thực tế cả nhóm xem chung một máy.
  - (b) Số người đã **vào cuộc** (`entered_at` khác NULL) trong suốt ván.
  - (c) Số người online lúc nộp kết luận.
- Đề xuất: **(b)**. Người vào rồi rời vẫn được tính, vì đã đóng góp.
- Các mức phân hạng, đề xuất: **1 người**, **2 người**, **3–4 người**, **5–6 người**, **7+ người**.
- Giới hạn tự nhiên không chặn được: nhiều người cùng xem một máy. Chấp nhận, vì bản hộp vốn chơi chung quanh bàn.
