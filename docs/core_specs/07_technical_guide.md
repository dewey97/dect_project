
<!-- START OF MERGED FILE: 07_TECH/07_technical_guide.md -->

---
# CẤU TRÚC MÃ NGUỒN DỰ ÁN (NEXT.JS PROJECT STRUCTURE) — VERITAS

> **Cấu trúc Thư mục:** Xây dựng trên nền tảng Next.js 16 (App Router), tuân thủ nguyên tắc thiết kế mã nguồn mô-đun hóa cao.

---

```
d:\code_world\dect_project/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── page.tsx                # Trang chủ & Story Hook
│   ├── activate/               # Cổng nhập mã kích hoạt vụ án
│   ├── dashboard/              # Tổng quan máy trạm điều tra
│   ├── evidence/               # Màn hình phân loại tang vật
│   │   └── [id]/               # Trình giả lập điện thoại Nokia & Soi chi tiết
│   ├── trace/                  # Công cụ dựng Timeline & Alibi Clash
│   └── api/                    # Serverless API endpoints
│       └── cases/              # Verification & Schema routes
├── components/                 # React UI Components
│   ├── ui/                     # Base Radix/Tailwind components
│   ├── evidence/               # Evidence Cards, Forensic Toggle
│   ├── timeline/               # Vertical Timeline & Dock
│   └── simulator/              # Phone simulator apps (SMS, Calls)
├── lib/                        # Shared Utilities & Engines
│   ├── engine/                 # Case Engine & Graph Verifier
│   ├── store/                  # Zustand state stores
│   └── db/                     # Dexie.js IndexedDB schema
├── content/                    # Case JSON schemas (.json)
└── docs/                       # Hệ thống tài liệu 12 phân khu
```
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 07_TECH/07_technical_guide.md -->

---
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

---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 07_TECH/07_technical_guide.md -->

---
# ĐẶC TẢ BỘ BA ENGINE CỐT LÕI (ENGINES ARCHITECTURE) — VERITAS

> **Nhiệm vụ Kiến trúc:** Bộ ba Engine vận hành lõi của hệ thống VERITAS, chịu trách nhiệm quản lý state local, parse & validate vụ án, và chấm điểm đồ thị suy luận khi kết án.

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│       Case Engine       │ ───► │     Content Engine      │ ───► │   Verification Engine   │
│  (Zustand State Store)  │      │  (Zod Schema Validator) │      │ (Graph Matching Algo)   │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## 01. Case Engine (Zustand State Store)

`Case Engine` quản lý toàn bộ trạng thái phiên chơi hiện tại của người điều tra, bao gồm danh sách bằng chứng đã mở khóa, tiến độ mục tiêu, và vị trí các thẻ trên bàn làm việc (Workstation Workspace).

### TypeScript Interface Core

```typescript
export interface CaseState {
  caseId: string;
  unlockedEvidenceIds: string[];
  activeObjectiveIds: string[];
  completedObjectiveIds: string[];
  timelineEvents: TimelineEvent[];
  alibiClashesFound: string[];
  
  // Actions
  unlockEvidence: (evidenceId: string) => void;
  registerAlibiClash: (clashId: string) => void;
  completeObjective: (objectiveId: string) => void;
}
```

---

## 02. Content Engine (Zod Schema Validator)

`Content Engine` có nhiệm vụ đọc file dữ liệu vụ án (`.json`), xác thực tính hợp lệ của schema trước khi nạp vào giao diện người chơi.

### Quy trình Xử lý (Parsing Pipeline)

1. **Fetch/Load Payload**: Tải tệp JSON từ local asset hoặc remote storage.
2. **Schema Verification**: Chạy qua bộ lọc `Zod` để đảm bảo không thiếu field bắt buộc (`requiredProofGraph`, `evidence`).
3. **Asset Resolution**: Ánh xạ đường dẫn hình ảnh, file âm thanh, bản dump điện thoại.

```typescript
import { z } from "zod";

export const CasePayloadSchema = z.object({
  caseId: z.string(),
  title: z.string(),
  difficulty: z.enum(["BEGINNER", "JUNIOR", "SENIOR", "MASTER"]),
  evidence: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string()
  })),
  solution: z.object({
    culpritId: z.string(),
    requiredProofGraph: z.array(z.object({
      from: z.string(),
      to: z.string(),
      relation: z.string()
    }))
  })
});
```

---

## 03. Verification Engine (Graph Matching Algorithm)

`Verification Engine` thực hiện kiểm thử lập luận nghi phạm & kết án dựa trên thuật toán so khớp đồ thị (Graph Matching) trong thời gian `< 5ms`.

### Thuật toán So khớp Đồ thị (Graph Verification Step)

1. Người chơi kéo thả liên kết giữa **Bằng chứng A** $\rightarrow$ **Lời khai B** $\rightarrow$ **Nghi phạm C**.
2. Engine dựng đồ thị liên kết tạm thời `UserGraph(V, E)`.
3. So khớp `UserGraph` với đồ thị đáp án chuẩn `SolutionGraph(V*, E*)`.
4. Trả về kết quả độ chính xác % và đánh giá cấp chỉ huy HQ.

```typescript
export interface VerificationResult {
  isCorrect: boolean;
  scorePercentage: number;
  matchedNodes: string[];
  missingNodes: string[];
  hqFeedback: string;
}
```


---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 07_TECH/07_technical_guide.md -->

---
# ĐẶC TẢ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA) — VERITAS

> **Nhiệm vụ Kiến trúc:** Đặc tả mô hình lưu trữ 2 lớp của VERITAS: Client Local Database (Dexie.js / IndexedDB) cho trải nghiệm Offline-first và Cloud Sync Database (Supabase PostgreSQL + RLS).

---

## 01. Client Local Storage Schema (Dexie.js / IndexedDB)

IndexedDB đóng vai trò lưu trữ nhanh toàn bộ trạng thái đang điều tra, nhật ký thao tác và bằng chứng đã mở khóa mà không cần kết nối mạng liên tục.

```typescript
import Dexie, { Table } from 'dexie';

export interface LocalEvidence {
  id: string;
  caseId: string;
  type: string;
  title: string;
  unlockedAt: string;
  notes?: string;
  pinned: boolean;
}

export interface LocalCaseProgress {
  caseId: string;
  currentChapter: number;
  completedObjectives: string[];
  unlockedEvidenceIds: string[];
  timelineNodes: any[];
  lastSavedAt: string;
}

export class VeritasLocalDB extends Dexie {
  evidence!: Table<LocalEvidence>;
  progress!: Table<LocalCaseProgress>;

  constructor() {
    super('VeritasLocalDB');
    this.version(1).stores({
      evidence: 'id, caseId, type, pinned',
      progress: 'caseId, lastSavedAt'
    });
  }
}

export const db = new VeritasLocalDB();
```

---

## 02. Cloud Database Schema (Supabase PostgreSQL)

Quản lý hồ sơ nhà điều tra, tài khoản, lịch sử mua/kích hoạt vụ án và lưu trữ tiến trình đồng bộ mây.

```sql
CREATE TABLE case_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    case_id VARCHAR(50) NOT NULL,
    activation_code VARCHAR(100) NOT NULL,
    activated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng tiến trình & xếp hạng
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    case_id VARCHAR(50) NOT NULL,
    efficiency_rank VARCHAR(10),
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 07_TECH/07_technical_guide.md -->

---
# HẠ TẦNG, HỆ THỐNG API & BẢO MẬT (INFRASTRUCTURE & SECURITY) — VERITAS

---

## 01. Hạ Tầng & Triển Khai (Vercel & Supabase)
* Frontend deploy trên **Vercel Edge Network**.
* Database PostgreSQL & Storage trên **Supabase** với Row Level Security (RLS).

## 02. Security & Anti-Spoiler Protocol
* Mã hóa đáp án chuẩn: Tập đáp án `solution.json` chỉ nằm ở Serverless API Routes.
* Client chỉ nhận phản hồi `VALIDATED` hoặc `REJECTED` từ Server.

---

<!-- END OF MERGED FILE: {src} -->
