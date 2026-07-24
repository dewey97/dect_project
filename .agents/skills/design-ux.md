# Skill: UI/UX Design — Creator OS

Check và cải thiện UI/UX cho Creator OS theo design system chuẩn.

## Design Principles

1. **Mobile-first** — mọi component bắt đầu từ mobile viewport (max 460px), mở rộng lên desktop
2. **Offline-aware UI** — luôn hiển thị connectivity indicator, optimistic updates, skeleton loading
3. **Consistency** — dùng Radix UI primitives, Tailwind v4 tokens, custom CSS variables từ `globals.css`
4. **Accessibility** — keyboard nav, focus rings, aria labels, color contrast
5. **Micro-interactions** — spring animations, hover states, transition-all duration-200

## Responsive Breakpoints

```css
/* globals.css */
--breakpoint-mobile: 460px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
```

| Viewport | Container | Nav |
|----------|-----------|-----|
| Mobile (< 768px) | `max-w-[460px]` centered | BottomTabs + FAB |
| Tablet (768-1024px) | Sidebar collapsed `w-[64px]` | Sidebar icons |
| Desktop (> 1024px) | 2-col grid / kanban | Sidebar expanded `w-[220px]` |

## Component Checklist

### Layout & Navigation
- [ ] Mobile: BottomTabs hiển thị, FAB active, sidebar ẩn
- [ ] Desktop: Sidebar hiển thị, BottomTabs ẩn, FAB ẩn
- [ ] Drawer (profile, quick capture): đúng width (60% / fullscreen mobile)
- [ ] Sheet/dialog: đúng kích thước màn hình

### Data States (mọi component phải handle)
- [ ] **Loading**: Skeleton hoặc Spinner (`components/ui/skeleton.tsx`, `components/ui/spinner.tsx`)
- [ ] **Empty**: "No data" message + illustration hoặc CTA button
- [ ] **Error**: ErrorBoundary + retry button + toast notification
- [ ] **Offline**: ConnectivityIndicator + mutation queue count
- [ ] **Optimistic**: UI update ngay lập tức trước sync

### Typography & Spacing
- [ ] Title: `text-lg font-semibold tracking-tight`
- [ ] Body: `text-sm leading-relaxed text-foreground/85`
- [ ] Caption: `text-[11px] text-muted-foreground`
- [ ] Card padding: `px-3 py-2.5` (tight), `p-4` (normal)
- [ ] Border radius: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-[16px]` / `rounded-[20px]`
- [ ] Gaps: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)

### Colors (CSS Variables)
```css
/* globals.css tokens */
--background / --foreground
--card / --card-foreground
--border / --border-hover
--primary / --primary-foreground
--accent / --accent-foreground
--muted / --muted-foreground
--danger / --danger-foreground
```

**Tailwind classes**: `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary/10`

### Animation
```tsx
// Preferred transition pattern
className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"

// Radix animation classes
className="animate-in fade-in slide-in-from-top-1 duration-200"
```

## Common Patterns

### Cards
```tsx
<div className="rounded-xl border border-border/50 bg-card px-3 py-2.5 shadow-sm">
  {children}
</div>
```

### Pressable (Button / Clickable Row)
```tsx
<button className="transition-all duration-200 active:scale-[0.98] hover:bg-accent/50">
```

### Progress Bar (Habit / Goal)
```tsx
<div className="h-1.5 w-full rounded-full bg-muted">
  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
</div>
```

### Stacked Layout
```tsx
<div className="flex flex-col gap-2">
  <div className="flex items-center justify-between">
    {/* row content */}
  </div>
</div>
```

## Validation Commands

```bash
# Visual check
pnpm dev  # → http://localhost:3000

# Component catalog
# Check docs/reference/components.md for existing patterns
```
