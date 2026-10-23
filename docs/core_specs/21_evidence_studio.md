# 21. Evidence Studio & Case Evidence Engine Architecture

> **Phạm vi:** Phân hệ quản trị `/studio/evidence` cho phép biên tập, lưu trữ và kiểm thử toàn bộ hồ sơ chứng cứ vụ án (tài liệu PDF, ảnh vật chứng hiện trường, tệp âm thanh ghi âm và không gian 360 Panorama) lưu trữ trên Supabase và Storage Bucket `evidence-assets`.
>
> **Trạng thái:** Triển khai hoàn tất trong gói công việc **WT-2** (`wt/evidence-db`), giải quyết triệt để các mã nợ kỹ thuật:
>
> - **M1**: Bỏ hardcode `CASE_000_PDFS` / `CASE_000_EVIDENCE` trong các trang gameplay.
> - **M2**: Evidence Studio biên soạn và quản lý chứng cứ vụ án theo từng `case_slug`.
> - **M3**: Migration 35 tạo bảng `case_evidence`, các cột `panorama_url`, `scene_360_url` và Storage bucket `evidence-assets`.
> - **M10**: Quản lý và tải lên tệp tin chứng cứ trực tiếp vào bucket Supabase.
> - **M12**: Động hóa ảnh hiện trường 360/Panorama cho `ReinvestigationModal` và `Scene360Viewer`.

---

## 1. Bối cảnh & Mục tiêu Kiến trúc

Trước khi triển khai Evidence Studio:

1. Danh mục chứng cứ gốc và tài liệu PDF bị lưu cố định trong file TypeScript `components/investigation/evidence/evidence-data.ts` (`CASE_000_PDFS`, `CASE_000_EVIDENCE`).
2. Các trang web gameplay (`app/(investigation)/evidence/web/page.tsx`, `boardgame/page.tsx`, `board-stage/page.tsx`) import trực tiếp các mảng hằng số tĩnh này, khiến việc tạo vụ án mới (Case #001, #002...) luôn bị gắn chặt với nội dung của Case #000.
3. Ảnh hiện trường 360 (`crime_scene_360.jpg`) và ảnh Panorama (`PANORAMA.png`) bị hardcode đường dẫn cục bộ trong `reinvestigation-modal.tsx` và `scene-360-viewer.tsx`.
4. Không có giao diện Studio chuẩn cho Game Master (GM) để upload ảnh hiện trường, tệp PDF, gán chuỗi bảo quản hoặc điều chỉnh phase mở khóa.

**Evidence Studio** mang lại giải pháp hoàn chỉnh:

- **Cơ sở dữ liệu Supabase per-case**: Toàn bộ chứng cứ gắn với `case_slug`, tham chiếu khóa ngoại `cases.slug`.
- **Giao diện 3 cột chuẩn Studio**: Cột trái lọc/tìm kiếm danh mục, cột giữa biên tập thông số giám định, cột phải mô phỏng trực quan thẻ chứng cứ diegetic và xem thử không gian 360.
- **Tải lên Storage Bucket `evidence-assets`**: Hỗ trợ tải trực tiếp tệp PDF, ảnh giám định sắc nét và âm thanh lời khai.
- **Tương thích ngược an toàn**: Hook `useCaseEvidence(caseId)` tự động ánh xạ dữ liệu Supabase sang các kiểu dữ liệu `PDFDocument` và `PhysicalEvidence`, đồng thời giữ fallback an toàn cho `case_000` khi chạy kiểm thử hoặc offline.

---

## 2. Cấu trúc Cơ sở Dữ liệu & Storage (Migration 35)

### 2.1. Bảng `public.case_evidence`

```sql
CREATE TABLE public.case_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'photo' CHECK (kind IN ('pdf', 'image', 'photo', 'audio', 'object')),
  file_url TEXT,
  thumb_url TEXT,
  phase INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT case_evidence_case_code_key UNIQUE(case_slug, code)
);
```

#### Phân loại trường:

- `code`: Mã định danh ngắn của chứng cứ trong vụ án (ví dụ: `00-HD`, `p1`, `p3`, `p10`, `EV-SIGN-01`).
- `kind`: `pdf` (tài liệu/biên bản), `photo`/`image` (ảnh hiện trường/vật chứng), `audio` (ghi âm), `object` (hiện vật niêm phong).
- `phase`: Giai đoạn xuất hiện trong tiến trình phá án (Phase 0: khởi đầu, Phase 1: Tuyến A, Phase 2: Tuyến B, Phase 3: Tuyến C).
- `slot_index`: Thứ tự sắp xếp hiển thị trên khay hồ sơ và bảng điều tra.
- `metadata`: Đối tượng JSONB chứa các thông số pháp y nghiệp vụ:
  - `evidenceId`: Mã tham chiếu vật chứng pháp lý (ví dụ: `EV-SCENE-OVERVIEW`, `EV-GLASS-SHARD`).
  - `recoveredBy`: Điều tra viên hoặc cán bộ thu thập (mặc định: `ĐIỀU TRA VIÊN`).
  - `chainOfCustody`: Chuỗi bảo quản tang vật (`VERIFIED`, `SECURED`).
  - `integrityStatus`: Tình trạng niêm phong (`secured`, `corrupted`, `analyzing`).
  - `timestamp`: Thời điểm thu giữ hoặc chụp ảnh hiện trường (ví dụ: `20:00`, `24/07/2016`).

### 2.2. Mở rộng Bảng `cases` cho Không gian 360

```sql
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS panorama_url TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS scene_360_url TEXT;
```

- `scene_360_url`: Đường dẫn ảnh toàn cầu Equirectangular Projection dùng cho WebGL Three.js Sphere.
- `panorama_url`: Đường dẫn ảnh toàn cảnh phẳng 2D dùng làm nền dự phòng khi mạng chậm.

### 2.3. Storage Bucket `evidence-assets`

- Tên bucket: `evidence-assets` (public read, write qua `private.is_admin()`).
- Cấu trúc thư mục:
  - `cases/<case_slug>/pdfs/`: Chứa các tài liệu, cẩm nang điều tra định dạng PDF.
  - `cases/<case_slug>/photos/`: Chứa ảnh vật chứng, ảnh hiện trường độ phân giải cao.
  - `cases/<case_slug>/audio/`: Chứa các đoạn thoại ghi âm, âm thanh hiện trường.
  - `cases/<case_slug>/scene360/`: Chứa ảnh cầu 360 và ảnh Panorama của hiện trường.

---

## 3. Server Actions & Hook Runtime

### 3.1. Server Actions (`lib/actions/evidence-actions.ts`)

| Hàm                                     | Phân quyền         | Chức năng                                                          |
| :-------------------------------------- | :----------------- | :----------------------------------------------------------------- |
| `getCaseEvidence(caseId)`               | Public / Anon      | Đọc danh sách chứng cứ theo case, sắp xếp theo phase và slot_index |
| `getCaseEvidenceByCode(caseId, code)`   | Public / Anon      | Đọc thông tin chi tiết của một mã chứng cứ                         |
| `upsertCaseEvidence(payload)`           | `requireAdminAuth` | Thêm mới hoặc cập nhật chứng cứ theo `case_slug` + `code`          |
| `deleteCaseEvidence(id)`                | `requireAdminAuth` | Xóa chứng cứ khỏi database                                         |
| `getCase360Config(caseId)`              | Public / Anon      | Lấy `panorama_url` và `scene_360_url` của vụ án                    |
| `updateCase360Config(caseId, config)`   | `requireAdminAuth` | Cập nhật URL ảnh 360/Panorama cho vụ án                            |
| `uploadEvidenceAsset(formData)`         | `requireAdminAuth` | Tải tệp lên bucket `evidence-assets` và trả về public URL          |
| `duplicateEvidenceData(source, target)` | `requireAdminAuth` | Sao chép toàn bộ chứng cứ và cấu hình 360 sang vụ án mới           |

### 3.2. Hook `useCaseEvidence(caseId)` (`lib/hooks/use-case-evidence.ts`)

Hook cung cấp interface thống nhất cho client-side components:

```ts
export interface CaseEvidenceState {
  pdfs: PDFDocument[];
  evidence: PhysicalEvidence[];
  rawEvidence: DbCaseEvidence[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

- Tự động phân tách danh sách `DbCaseEvidence` thành hai luồng dữ liệu chuẩn `pdfs` và `evidence`.
- Tích hợp bộ nhớ đệm in-memory (TTL 30 giây) chống fetch trùng lặp giữa các tabs.
- Đảm bảo an toàn tuyệt đối cho `case_000` khi cơ sở dữ liệu chưa chạy migration.

---

## 4. Giao diện Evidence Studio (`/studio/evidence`)

Giao diện được thiết kế theo chuẩn công thái học trinh thám:

1. **Thanh công cụ đỉnh (Toolbar)**:
   - Bộ chọn vụ án (Case Picker) chuyển đổi tức thì giữa các vụ.
   - Nút "Cấu hình Hiện Trường 360" mở hộp thoại cập nhật `scene_360_url` và `panorama_url`.
   - Nút "+ Thêm Chứng Cứ" tạo bản ghi mới.
   - Nút "Làm mới" xóa cache và fetch lại từ Supabase.

2. **Cột 1: Danh bạ Chứng cứ (Catalog & Filters)**:
   - Ô tìm kiếm thời gian thực theo mã code, tiêu đề hoặc mô tả.
   - Thanh lọc nhanh theo loại: Tất cả, Ảnh, PDF, Audio, Vật phẩm.
   - Lọc theo Phase: All, P0, P1, P2, P3.
   - Thẻ danh sách hiển thị rõ ràng mã `#code`, Phase, Slot và trạng thái loại hình.

3. **Cột 2: Khung Biên soạn Thông số (Editor Form)**:
   - Nhập mã chứng cứ, loại hình, tiêu đề, giai đoạn mở khóa.
   - Tải lên tệp tin trực tiếp hoặc nhập URL bên ngoài.
   - Nhập thông số giám định pháp y (thời điểm, người thu thập, niêm phong, chuỗi bảo quản).

4. **Cột 3: Khung Mô phỏng Trực quan (Live Preview)**:
   - Chế độ "Hồ sơ tang vật": Hiển thị chứng cứ đúng theo phong cách thẻ bìa Manila, có con dấu niêm phong, bảng thông số pháp y và nút mở tài liệu.
   - Chế độ "Hiện trường 360": Khởi chạy `Scene360Viewer` với góc nhìn Three.js tương tác trực tiếp ngay trong Studio.

---

## 5. Quy Trình Nhân Bản Vụ Án (`duplicateEvidenceData`)

Khi Game Master thực hiện nhân bản một vụ án (ví dụ từ `case_000` sang `case_001`):

1. Hàm `duplicateEvidenceData('case_000', 'case_001')` đọc toàn bộ các dòng trong `case_evidence` của vụ nguồn.
2. Tạo các bản ghi mới với `case_slug = 'case_001'` và cấp phát UUID mới.
3. Sao chép các trường `panorama_url` và `scene_360_url` từ bản ghi `cases` nguồn sang vụ án đích.
4. Ghi nhận vào báo cáo tích hợp để người tích hợp liên kết vào hàm `duplicateCase()` trong `case-actions.ts`.
