# Kế hoạch: Màn mua và thanh toán bản online (PayOS)

> Trạng thái: đã duyệt, code xong 2026-11-06 (chưa commit). Ngày: 2026-11-05.

## Triển khai (2026-11-06)

| Phần             | File                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Migration        | [`db/schema/53_payments.sql`](../../db/schema/53_payments.sql) (chủ dự án chạy)                                                        |
| Client PayOS     | `lib/payments/payos.ts`, test `lib/payments/payos.test.ts`                                                                             |
| API              | `app/api/checkout/route.ts`, `app/api/payments/payos/webhook/route.ts`, `app/api/orders/[orderCode]/route.ts`                          |
| Màn hình         | `app/buy/[caseId]/page.tsx` + `components/buy/buy-offers.tsx`; `app/buy/result/[orderCode]/page.tsx` + `components/buy/buy-result.tsx` |
| Đăng ký webhook  | `scripts/ops/payos-confirm-webhook.mjs`                                                                                                |
| Link vào màn mua | `components/play/play-entry.tsx` ("Mua vụ án")                                                                                         |

Khác với bản kế hoạch dưới đây:

- Màn kết quả là `/buy/result/<orderCode>` (tham số đường dẫn), không phải `?orderCode=`. PayOS tự gắn query của nó vào `returnUrl`, dùng đường dẫn thì không bị trùng tham số.
- Hàm SQL tách làm hai: `order_create` (lấy giá từ `case_offers`, cấp `order_code`) và `grant_license_for_order(order_code, amount, payload)`. Số tiền lệch thì hàm đánh dấu đơn `failed` và trả `amount_mismatch` (không raise, để việc đánh dấu không bị rollback).
- `orders` có thêm trạng thái `failed` (tạo link PayOS lỗi, hoặc số tiền lệch) và cột `group_credits` chụp lại lúc mua.
- Link thanh toán hết hạn sau 15 phút (`expiredAt`).
- Seed case_000: Solo 69.000đ, Nhóm 79.000đ (+1 lượt), Party 89.000đ (+3 lượt), Bộ hộp chưa có link sàn. Sửa giá bằng SQL trên `case_offers`.
- `/buy/<case_id>` nay chuyển hướng sang `/cases/<case_id>#online` (trang vụ án, xem mục Flow).
- `.env.example` chưa được cập nhật tự động (agent không có quyền đọc file `.env*`). Cần thêm tay 5 dòng: `PAYOS_CLIENT_ID=`, `PAYOS_API_KEY=`, `PAYOS_CHECKSUM_KEY=`, `APP_BASE_URL=`, `PLAY_GATING_ENABLED=false`.

Các bước khi có key:

1. Chạy `db/schema/53_payments.sql` trên Supabase.
2. Thêm 4 biến vào `/var/www/dect_project/.env.server` trên VPS, restart container.
3. Từ máy có repo: `node --env-file=.env.local scripts/ops/payos-confirm-webhook.mjs` (với `.env.local` chứa đúng key và `APP_BASE_URL` production).
4. Mua thử 1 gói, kiểm `orders.status = 'paid'` và có dòng trong `licenses`.

> Liên quan: [`product/license_access.md`](../product/license_access.md), [`product/license_technical.md`](../product/license_technical.md), [`product/business_model.md`](../product/business_model.md).

## Flow mua và chơi (chốt 2026-11-06)

```
Landing (băng chuyền: badge sở hữu + [Chơi online] [Đặt hộp], hoặc [Vào chơi] khi đã sở hữu)
  │  Hero "Phá Án Ngay", how-to-play cũng trỏ về đây
  ▼
/cases/<case_id>   trang vụ án, cửa duy nhất
  ├── badge: Chưa sở hữu / Đã có bản online / Đã kích hoạt hộp
  ├── [Vào chơi]  khóa khi bật chặn và chưa sở hữu
  ├── #box     ảnh hộp, [Đặt hàng] (link sàn), form "Nhập mã trong nắp hộp"
  └── #online  gói Solo / Nhóm / Party, [Mua] → PayOS → /buy/result/<orderCode>
  ▼
/play/<case_id>    Tạo phòng / Vào phòng / Chơi một mình
```

Quyết định:

1. Sở hữu hộp: mỗi hộp một mã 12 ký tự (`XXXX-XXXX-XXXX`), dùng 1 lần, gắn vào tài khoản (cần đăng nhập). DB chỉ lưu sha256 (`box_codes`). QR trong nắp hộp trỏ `/cases/<case_id>?code=<mã>` để điền sẵn. Sinh mã: `scripts/ops/generate-box-codes.mjs`.
2. Chỉ Host cần sở hữu. Link có `?room=` (người được mời) không bị chặn. Có hộp: tạo phòng miễn phí (mode `box`). Chỉ có bản online: mỗi lần tạo phòng trừ 1 `group_credits` (mode `online`), hoàn lượt nếu tạo phòng lỗi.
3. Chơi một mình cũng cần sở hữu (link nằm trong `/play`, đã bị chặn theo).

Cờ `PLAY_GATING_ENABLED=true` (server) bật việc chặn. Khi tắt (mặc định):

- trang vụ án và băng chuyền vẫn hiện trạng thái, nút Vào chơi mở cho mọi người;
- `/api/rooms/create` không kiểm quyền, không trừ lượt;
- `/activate` vẫn cho vào bằng mã bất kỳ như cũ (API trả `gating: false`).

Bật cờ sau khi PayOS chạy thật và đã in mã hộp.

Cổng quyền chơi áp cho `/play/<case_id>`, `/evidence/web` và `/evidence/boardgame` (2026-11-06):

- Server (`serverAllowsPlay`): cho qua khi cờ tắt, khi URL có `?room=`, hoặc khi tài khoản sở hữu vụ.
- Client (`CaseAccessGuard`): server từ chối nhưng thiết bị còn phiên phòng của vụ này (người được mời) thì vẫn cho vào; còn lại chuyển về `/cases/<case_id>`.

Còn hở: `/evidence/[id]` (xem một vật chứng lẻ) không chặn; API nội dung (`/api/checkpoints`, `/api/case-dossiers`...) không kiểm quyền, nên người rành kỹ thuật vẫn đọc được dữ liệu. Phiên phòng nằm ở localStorage nên người cố tình vẫn giả được.

## Mục tiêu

Làm sẵn màn mua và luồng thanh toán. Khi chưa có key PayOS, màn mua vẫn hiện đầy đủ nhưng nút thanh toán báo "Sắp mở bán". Khi điền 3 key vào `.env.server` và đăng ký webhook, luồng chạy ngay, không sửa code.

## Phạm vi

Có trong bước này:

1. Bảng gói bán theo vụ (`case_offers`), đơn hàng (`orders`), quyền chơi (`licenses`).
2. Màn mua `/buy/<case_id>`: các gói bản online, khối bộ hộp (link Shopee / TikTok Shop), nút thanh toán.
3. API tạo đơn, webhook PayOS, API xem trạng thái đơn.
4. Màn kết quả `/buy/result`: chờ thanh toán, đã thanh toán, đã hủy.

Chưa làm trong bước này (cần chốt riêng):

- Chặn `/play` và `/evidence/web` theo license (câu hỏi 3 ở dưới).
- Mã trong hộp và quyền bộ hộp (câu hỏi 1, 2).
- Trừ lượt nhóm khi tạo phòng bản online.
- Studio sửa gói bán. Bước này gói bán nằm trong DB, sửa bằng migration.

## Dữ liệu (migration 53, chủ dự án chạy)

`case_offers`: gói bán của từng vụ.

| Cột                    | Kiểu    | Ghi chú                                                  |
| ---------------------- | ------- | -------------------------------------------------------- |
| `id`                   | uuid    |                                                          |
| `case_id`              | text    | slug vụ                                                  |
| `sku`                  | text    | `solo`, `group`, `party`, `addon`; unique cùng `case_id` |
| `kind`                 | text    | `online` (thanh toán PayOS) hoặc `box` (link ngoài)      |
| `title`, `description` | text    |                                                          |
| `price_vnd`            | integer | 0 với `box`                                              |
| `group_credits`        | integer | lượt nhóm cộng thêm khi mua                              |
| `external_url`         | text    | link Shopee / TikTok cho `box`                           |
| `sort_order`, `active` |         |                                                          |

`orders`: một lần bấm thanh toán.

| Cột                               | Kiểu        | Ghi chú                                                     |
| --------------------------------- | ----------- | ----------------------------------------------------------- |
| `id`                              | uuid        |                                                             |
| `order_code`                      | bigint      | unique, lấy từ sequence bắt đầu 100000. PayOS cần số nguyên |
| `user_id`                         | uuid        | `auth.users`                                                |
| `case_id`, `sku`, `amount_vnd`    |             | chụp lại giá lúc mua                                        |
| `status`                          | text        | `pending`, `paid`, `cancelled`, `expired`                   |
| `payment_link_id`, `checkout_url` | text        | từ PayOS                                                    |
| `paid_at`, `created_at`           | timestamptz |                                                             |
| `provider_payload`                | jsonb       | webhook gốc, để đối soát                                    |

`licenses`: quyền chơi bản online.

| Cột                        | Kiểu    | Ghi chú              |
| -------------------------- | ------- | -------------------- |
| `user_id`, `case_id`       |         | unique cặp này       |
| `group_credits`            | integer | cộng dồn mỗi lần mua |
| `source`                   | text    | `payos`, `manual`    |
| `created_at`, `updated_at` |         |                      |

RLS: người chơi chỉ đọc `orders` và `licenses` của chính mình; `case_offers` đọc công khai khi `active`. Mọi thao tác ghi chỉ qua service role ở server.

Hàm SQL `grant_license_for_order(order_code)` chạy trong một transaction: khóa đơn, nếu đơn đã `paid` thì bỏ qua (webhook gửi lại nhiều lần vẫn đúng), nếu chưa thì đánh dấu `paid` và upsert `licenses` cộng `group_credits`.

## Server

`lib/payments/payos.ts` (thuần, có unit test):

- `signPaymentRequest`: HMAC_SHA256 bằng checksum key trên chuỗi `amount=..&cancelUrl=..&description=..&orderCode=..&returnUrl=..`.
- `verifyWebhookSignature`: sắp xếp key của `data`, `null` thành chuỗi rỗng, nối `key=value` bằng `&`, HMAC_SHA256, so sánh hex bằng `timingSafeEqual`.
- `createPaymentLink`, `getPaymentLink`: gọi `https://api-merchant.payos.vn/v2/payment-requests` với header `x-client-id`, `x-api-key`.

Route Handler:

| Route                              | Việc                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/checkout`               | Bắt buộc đăng nhập. Nhận `caseId`, `sku`. Đọc giá từ `case_offers` (không tin giá client gửi). Thiếu key PayOS thì trả 503 `payments_disabled`. Tạo `orders`, gọi PayOS, trả `checkoutUrl`. |
| `POST /api/payments/payos/webhook` | Xác thực chữ ký. Sai chữ ký trả 401. Đúng và `code == "00"` thì gọi `grant_license_for_order`, kiểm số tiền khớp `amount_vnd`. Luôn trả 2xx cho webhook hợp lệ.                             |
| `GET /api/orders/<orderCode>`      | Chủ đơn xem trạng thái. Đơn còn `pending` thì hỏi lại PayOS để không phụ thuộc webhook đến trễ.                                                                                             |

Mọi route có `export const dynamic = "force-dynamic"`.

`description` gửi PayOS: `DH<orderCode>` (8 ký tự), vì tài khoản ngân hàng không liên kết qua payOS chỉ nhận 9 ký tự.

## Biến môi trường (server, không vào `.env` track)

| Biến                 | Nguồn                                             |
| -------------------- | ------------------------------------------------- |
| `PAYOS_CLIENT_ID`    | my.payos.vn, kênh thanh toán                      |
| `PAYOS_API_KEY`      | như trên                                          |
| `PAYOS_CHECKSUM_KEY` | như trên, sinh sau khi tạo kênh                   |
| `APP_BASE_URL`       | URL công khai, dùng làm `returnUrl` / `cancelUrl` |

Thiếu bất kỳ biến nào thì thanh toán tắt, màn mua hiện "Sắp mở bán". Cập nhật `.env.example`.

Sau khi có key: gọi `POST https://api-merchant.payos.vn/confirm-webhook` với `webhookUrl = <APP_BASE_URL>/api/payments/payos/webhook` (một lần, script `scripts/ops/payos-confirm-webhook.mjs`).

## Màn hình

- `/buy/<case_id>`: ảnh bìa, tóm tắt, danh sách gói `online`, khối `box`. Bấm gói: chưa đăng nhập thì sang `/login?next=/buy/<case_id>`; đã đăng nhập thì gọi `/api/checkout` rồi chuyển sang `checkoutUrl` của PayOS. Đã có license thì hiện "Đã sở hữu" và nút vào `/play/<case_id>`.
- `/buy/result?orderCode=...`: PayOS trả về đây. Hỏi `/api/orders/<orderCode>` mỗi 3 giây tối đa 2 phút. Đã thanh toán thì nút vào `/play/<case_id>`.
- Màn vào game `/play/<case_id>` thêm link "Mua vụ án" sang `/buy/<case_id>`. Chưa chặn ai.

UI giữ tối giản, chỉnh giao diện sau.

## Kiểm thử

- Unit: ký và xác thực chữ ký (đổi 1 ký tự phải fail), `null` thành chuỗi rỗng, sắp xếp key.
- Không có key: `/api/checkout` trả 503, màn mua hiện "Sắp mở bán".
- Có key test: tạo đơn, mở `checkoutUrl`; webhook giả có chữ ký đúng cấp license một lần dù gửi 2 lần; webhook sai chữ ký trả 401.

## Câu hỏi còn mở

1. Mã trong hộp: một mã chung cho mọi hộp hay mỗi hộp một mã?
2. Người chơi bộ hộp có xem tài liệu số trên app không?
3. Khi nào chặn `/play` và "Chơi một mình" theo license?
4. Giá và gói cụ thể cho case_000 (mặc định theo `license_access.md`: Solo, Nhóm +1 lượt, Party +3 lượt; giá 69.000đ đến 89.000đ).
5. PayOS chưa ghi rõ trạng thái `PAID` / `EXPIRED` trong trang đã đọc; cần xác nhận khi có tài khoản test.
