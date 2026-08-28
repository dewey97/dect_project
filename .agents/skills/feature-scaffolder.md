# Feature Scaffolder Skill

Scaffold new features following the Creator OS (Loggd) offline-first architecture.

## 11-Step Process

### Step 1: Define Types (`types/index.ts`)
```typescript
export interface YourItem {
  id: string
  user_id: string
  title: string
  // ... your fields
  created_at: string
  updated_at: string
}

export interface CreateYourItemInput {
  title: string
  // ... input fields
}

export interface UpdateYourItemInput {
  title?: string
  // ... optional input fields
}
```

### Step 2: SQL Migration (`supabase/migrations/YYYYMMDDHHMMSS.sql`)
```sql
CREATE TABLE your_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE your_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own items"
  ON your_items FOR SELECT USING (auth.uid() = user_id);
-- ... insert, update, delete policies
```

### Step 3: Dexie Schema (`lib/offline/local-db.ts`)
```typescript
// Bump version number (e.g., version(4) → version(5))
this.version(5).stores({
  // ... existing tables
  your_items: 'id, user_id, created_at',
})
```

### Step 4: Server Actions (`app/actions/your-items.ts`)
```typescript
'use server'
export async function createYourItemAction(input: CreateYourItemInput) {
  try {
    const { data, error } = await supabase
      .from('your_items')
      .insert({...})
      .select()
      .single()
    return { success: !error, data, error: error?.message }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
```

### Step 5: Local Repository (`lib/offline/repositories.ts`)
```typescript
export const localYourItemRepository = createBaseRepository<YourItem>(localDB.your_items)
```

### Step 6: Sync Engine (`lib/offline/sync-engine.ts`)
Add case to `processSyncQueue` and `pullRemoteData` for `'your_items'`.

### Step 7: Zustand Slice (`lib/store/slices/your-slice.ts`)
```typescript
export const createYourSlice = (set, get) => ({
  yourItems: [],
  async addYourItem(input) {
    const id = crypto.randomUUID()
    const item = { id, ...input, user_id, created_at, updated_at }
    set(state => ({ yourItems: [...state.yourItems, item] }))
    await localYourItemRepository.put(item)
    await syncEngine.enqueueMutation('your_items', 'insert', id, input)
  },
  // ... loadYourItems, updateYourItem, deleteYourItem
})
```

### Step 8: Register Slice (`lib/store/app-store.ts`)
```typescript
import { createYourSlice } from './slices/your-slice'
// Add to AppState type and compose in create()
```

### Step 9: Components (`components/your-feature/`)
```tsx
// your-feature-list.tsx, your-feature-card.tsx, etc.
// Use useAppStore() for state, dispatch actions via slice
```

### Step 10: Route (`app/(dashboard)/(your-feature)/your-page/page.tsx`)
```tsx
export default function YourPage() {
  return <YourFeatureList />
}
```

### Step 11: Tests
```bash
# Unit tests for slice
__tests__/unit/lib/store/your-slice.test.ts

# Component tests
__tests__/unit/components/your-feature-list.test.tsx

# E2E tests
__tests__/e2e/your-feature.spec.ts
```

## Validation Commands
```bash
pnpm type-check
pnpm test:run
pnpm lint
```
