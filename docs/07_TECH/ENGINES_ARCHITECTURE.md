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

