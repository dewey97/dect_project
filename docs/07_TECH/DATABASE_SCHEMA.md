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