# Hướng Dẫn Phát Triển & Bản Địa Hóa (Development & Localization)

Tài liệu này hướng dẫn cách vận hành cục bộ, biên dịch vụ án mới, và quy ước dịch tiếng Việt thống nhất cho dự án VERITAS OS.

---

## 🚀 Khởi Chạy Môi Trường Phát Triển

Dự án sử dụng trình quản lý gói `pnpm`. Tuyệt đối không dùng `npm` hoặc `yarn` để tránh xung đột file lock.

```bash
# Cài đặt thư viện
pnpm install

# Khởi chạy máy chủ dev cục bộ
pnpm dev

# Kiểm tra kiểu TypeScript tĩnh
pnpm tsc --noEmit

# Biên dịch thử nghiệm bản Production
pnpm build
```

---

## 🌐 Quy Ước Bản Địa Hóa Tiếng Việt (Localization Rules)

Để giữ đúng tinh thần **Noir** u tối, kỳ bí nhưng vẫn chuyên nghiệp, toàn bộ chuỗi ký tự trên giao diện cần tuân thủ các quy ước dịch thuật sau:

1. **Thuật ngữ kỹ thuật / Pháp y**:
   * *Burner phone* $\rightarrow$ Điện thoại phụ / Điện thoại tang vật
   * *Evidence Locker / Forensics Hub* $\rightarrow$ Hồ sơ tang vật / Không gian pháp y
   * *Chain of Custody* $\rightarrow$ Nhật ký giám sát tang vật
   * *Integrity secured* $\rightarrow$ Toàn vẹn dữ liệu: An toàn
   * *Seizure status* $\rightarrow$ Trạng thái khi thu giữ
   * *Decrypt / Chip-off extraction* $\rightarrow$ Giải mã / Trích xuất phần cứng

2. **Cách xưng hô của Trợ lý Minh**:
   * Minh đóng vai trò là một điều phối viên hỗ trợ thám tử từ tổng cục, có cá tính sắc sảo, nghiêm túc.
   * Xưng hô mặc định: **Minh** (hoặc *Tôi*) và gọi người chơi là **Thám tử** (hoặc *Bạn*). Tránh dịch sang giọng điệu máy móc như *"Hệ thống hỗ trợ thám tử..."*.

3. **Thông báo lỗi hệ thống**:
   * Cần giữ nguyên định dạng in hoa viết liền kèm dấu gạch dưới để mô phỏng hệ điều hành retro (Ví dụ: `YÊU_CẦU_MÃ_PIN`, `LỖI_TÍNH_TOÀN_VẸN`, `ĐANG_GIẢI_MÃ_...`).

---

## 📂 Hướng Dẫn Thêm Kịch Bản Vụ Án Mới
Dữ liệu kịch bản vụ án được lưu trữ tách biệt trong thư mục `content/cases/case-001/`. Khi thêm vụ án mới (ví dụ: `case-002`), bạn cần:
1. Tạo thư mục `content/cases/case-002/`.
2. Tạo các tệp dữ liệu tương ứng: `emails.ts`, `messages.ts`, `photos.ts`, `browser-history.ts` mô tả dữ liệu trên chiếc điện thoại của nghi phạm vụ án 002.
3. Cập nhật cơ sở dữ liệu mock-data tại `lib/mock-data.ts` để đăng ký vụ án mới vào danh sách lựa chọn ở Dashboard.

---

## 📄 Quy Trình Thêm Tang Vật Tĩnh (PDF, Hình Ảnh, Báo Cáo Scan)
Để tránh việc các nhà biên kịch game phải viết mã nguồn phức tạp, hệ thống hỗ trợ tích hợp trực tiếp các tài liệu PDF/Hình ảnh tĩnh (ví dụ: Biên bản khám nghiệm tử thi, bản vẽ tay hiện trường, sao kê tài khoản ngân hàng):

1. **Chuẩn bị tệp tin tĩnh**:
   * Xuất tài liệu thiết kế sang định dạng `.pdf` hoặc `.png`/`.jpg`.
   * Đặt các tệp tin này vào thư mục tĩnh: `public/documents/case-002/` (Ví dụ: `public/documents/case-002/bien-ban-kham-nghiem.pdf`).

2. **Khai báo liên kết đơn giản trong `lib/mock-data.ts`**:
   * Tại danh sách bằng chứng (`EVIDENCE`), bạn chỉ cần thêm một bản ghi mới với trường `url` chỉ định tới tệp vừa lưu:
     ```typescript
     {
       id: 'ev-02-doc-pdf',
       caseId: 'case-002',
       evidenceId: 'EX-002-DOC-01',
       title: 'Biên Bản Khám Nghiệm Pháp Y',
       kind: 'document',
       url: '/documents/case-002/bien-ban-kham-nghiem.pdf', // Đường dẫn tĩnh
       recoveredBy: 'Bác sĩ pháp y Trần',
       timestamp: '15/03/2026 08:00',
       integrityStatus: 'secured',
       chainOfCustody: 'Chuyển trực tiếp từ phòng thí nghiệm tổng cục.'
     }
     ```
3. **Hiển thị trên giao diện máy trạm**:
   * Hệ thống sẽ tự động nhận diện trường `url` và nhúng **Trình đọc PDF trực tuyến (PDF Viewer)** hoặc khung phóng to ảnh để người chơi cuộn đọc tài liệu trực tiếp một cách trực quan, giữ trọn vẹn dấu vết, hình ảnh minh họa trên tài liệu giấy.
