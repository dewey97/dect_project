# 🔐 Hệ Thống License & Access Control

> **Trạng thái:** Draft — đang bàn luận, chưa implement  
> **Cập nhật lần cuối:** 2026-10-10  
> **Tài liệu kỹ thuật:** xem `08_license_technical_spec.md`

---

## 1. Tổng Quan Mô Hình

Hai hình thức chơi, phân biệt bởi **nơi tài liệu được lưu trữ**:

| | **Board Game** | **Bản Online** |
|---|---|---|
| Tài liệu ở đâu? | Bản in trong bộ game, đọc bằng tay | Hiển thị trên màn hình trong app |
| App làm gì? | Hỗ trợ gameplay (manh mối, bản đồ, timeline...) | Cung cấp cả gameplay lẫn toàn bộ tài liệu số |
| Kích hoạt | Quét QR in trong bộ game | Mua license, đăng nhập |
| Cần account? | ❌ | ✅ |

---

## 2. Boardgame

- Người chơi nhận **bộ Boardgame** gồm: tài liệu in, bằng chứng vật lý, QR kích hoạt
- Web app đóng vai trò **công cụ hỗ trợ điều tra** — không thay thế tài liệu in
- Không cần account, không cần mạng

| Vấn đề | Quyết định |
|---|---|
| Cần account? | ❌ Không |
| Cần mạng? | ❌ Không |
| Chống share QR? | ❌ Không cần — share QR chỉ vào app công cụ, không có tài liệu số |
| Có expiry? | Chưa quyết định |
| Track lượt chơi? | ❌ Không track được — chấp nhận |

---

## 3. Bản Online

- Người chơi mua trên web — **không có bộ Boardgame**
- Cung cấp **toàn bộ tài liệu số**: lời khai, hồ sơ, ảnh hiện trường, chứng cứ số
- Bắt buộc có account — 1 license = 1 game, gắn vào account

| Vấn đề | Quyết định |
|---|---|
| Account bắt buộc? | ✅ Có |
| Giới hạn thiết bị? | Không áp dụng — xung đột với group play |
| Upgrade từ board game lên online? | Chưa quyết định |

---

## 4. So Sánh 2 Hình Thức

| | **Board Game** | **Bản Online** |
|---|---|---|
| Kích hoạt | QR trong bộ game | Mua license trên web |
| Cần account | ❌ | ✅ |
| Cần mạng | ❌ | ✅ |
| Tài liệu | Bản in trong bộ game | Tài liệu số trên màn hình |
| Vai trò của App | Hỗ trợ gameplay | Gameplay + toàn bộ tài liệu |
| Track lượt chơi | ❌ | ✅ |

---

## 5. Group Play — Chơi Theo Nhóm

> **1 license = quyền truy cập solo vĩnh viễn + N lượt tạo phòng nhóm**

```
Mua license case_000
├── Tự chơi: vô hạn lần, không tốn lượt
└── Chơi nhóm: mỗi lần tạo phòng tốn 1 lượt
```

**Flow chơi nhóm:**
```
Host tạo phòng (tốn 1 lượt) → nhận mã phòng → share cho nhóm
Mọi người join bất kỳ lúc, chỉ cần nickname
Bất kỳ ai submit đáp án → Case kết thúc → Phòng đóng
```

| Quy tắc | Quyết định |
|---|---|
| Host phải online liên tục? | ❌ Không |
| Ai submit được đáp án? | ✅ Bất kỳ ai trong phòng |
| Phòng active cùng lúc/license | Tối đa 1 |
| Số người tối đa/phòng | Chưa chốt |
| Thời gian tối đa 1 phòng | Chưa chốt |

**Gói bán gợi ý:**

| Gói | Nội dung |
|---|---|
| **Solo** | Tự chơi vĩnh viễn, 0 lượt nhóm |
| **Duo/Nhóm** | Tự chơi + 1 lượt nhóm |
| **Party** | Tự chơi + 3 lượt nhóm |
| **Add-on** | +1 lượt nhóm |

---

## 6. Rủi Ro Vận Hành

> Rủi ro kỹ thuật xem tại `08_license_technical_spec.md`

#### [VUL-01] Chia Sẻ Tài Khoản
```
Ai đó tạo email rác → mua 1 license → share thông tin đăng nhập
→ Nhiều người dùng chung 1 tài khoản, không tốn lượt nhóm
```
- **Rào cản tự nhiên:** Email cá nhân → share = mất quyền kiểm soát tài khoản
- **Quyết định:** Chấp nhận — theo dõi qua đo lường, xử lý thủ công nếu phát hiện bất thường

#### [VUL-02] Bẻ Khóa Ứng Dụng
```
Can thiệp vào app → bỏ qua kiểm tra QR → vào game không cần mua Boardgame
```
- **Tác động:** Thấp — vì không có tài liệu số trong app
- **Quyết định:** Chấp nhận

---

## 7. Chính Sách Hoàn Tiền

**Không hoàn tiền** sau khi đã truy cập nội dung vụ án — thay bằng **bản chơi thử miễn phí** phần đầu để người dùng trải nghiệm trước khi mua.

---

## 8. Quyết Định Còn Mở

- [ ] **Số người tối đa/phòng**
- [ ] **Thời gian tối đa 1 phòng**
- [ ] **Nâng cấp từ Boardgame lên Bản Online:** Người mua Boardgame có được giảm giá khi mua Bản Online không?
- [ ] **Hết hạn QR:** Mã QR trong bộ game cũ có hết hạn không?
- [ ] **Gói mua nhiều vụ án:** 1 license có bao gồm nhiều vụ án cùng lúc không?
