# Test Runner Skill

Run and analyze tests for the Creator OS (Loggd) project.

## Test Commands

```bash
pnpm test:run          # Run all unit tests once
pnpm test:watch        # Run in watch mode (active development)
pnpm test:coverage     # Run with coverage report
pnpm test:e2e          # Run E2E tests (requires dev server)
pnpm test:e2e:ui       # Run E2E in UI mode
pnpm test:all          # Run unit + E2E
```

## Test File Locations

- Unit tests: `__tests__/unit/**/*.test.ts(x)`
- Integration tests: `__tests__/integration/**/*.test.ts`
- E2E tests: `__tests__/e2e/**/*.spec.ts`
- Test helpers: `__tests__/helpers/`
- Mocks: `__tests__/mocks/`
- Setup: `__tests__/setup.ts`
- Config: `vitest.config.ts`, `playwright.config.ts`

## Test Patterns

### Unit Tests (vitest)
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockHabit } from '__tests__/mocks/factories'

describe('feature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', () => {
    const habit = createMockHabit()
    expect(habit.title).toBe('Test Habit')
  })
})
```

### Component Tests
```tsx
import { render, screen } from '__tests__/helpers/render'
import { createMockHabit } from '__tests__/mocks/factories'
import HabitRow from '@/components/habits/habit-row'

describe('HabitRow', () => {
  it('renders habit title', () => {
    const habit = createMockHabit({ title: 'Morning Run' })
    render(<HabitRow habit={habit} />)
    expect(screen.getByText('Morning Run')).toBeInTheDocument()
  })
})
```

## Coverage Targets

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Common Failure Patterns

1. **Dexie/IndexedDB errors**: `fake-indexeddb/auto` is in setup.ts — verify import
2. **Mock not reset**: Check `vi.clearAllMocks()` in `beforeEach`
3. **Component render errors**: Verify mock providers in `__tests__/helpers/render.tsx`
4. **TypeScript errors**: Run `pnpm type-check` first
5. **Fake timers**: Always call `vi.useRealTimers()` in cleanup

## CI Integration

Tests run via GitHub Actions on push/PR:
- Unit tests with coverage upload
- E2E tests with Playwright report upload
- Type-check and lint as gatekeepers
