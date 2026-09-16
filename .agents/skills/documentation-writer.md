# Documentation Writer Skill

Write and maintain project documentation for Creator OS (Loggd).

## Documentation Structure

```
docs/
  index.md                    # Wiki entry point
  architecture.md             # System architecture
  database.md                 # DB schema reference
  offline_first_guide.md      # Offline-first patterns
  debugging_guide.md          # Debug tips
  guides/                     # How-to guides
    development.md            # Dev setup & workflow
    testing.md                # Test setup & patterns
    deployment.md             # Vercel deployment
    contributing.md           # PR & commit conventions
  api/                        # API reference
    store-api.md              # Zustand store API
    sync-engine-api.md        # SyncEngine class
    server-actions.md         # Server Actions catalogue
    repositories-api.md       # Local repository CRUD
  reference/                  # Reference docs
    types.md                  # TypeScript types
    components.md             # Component library
    hooks.md                  # Custom hooks
    utilities.md              # Utility functions
  archive/                    # Historical docs
```

## Writing Standards

1. Use GitHub-flavored Markdown
2. Every `.md` must have an `# h1` title
3. Code blocks must specify language: ```typescript, ```sql, ```bash
4. API docs include: description, parameters, return type, example
5. All links are relative within `docs/`
6. Update `docs/index.md` when adding new docs

## Auto-Generate Scripts

```bash
pnpm docs:generate    # Regenerate docs/index.md
pnpm docs:api         # Generate API docs from source
pnpm docs:all         # Run both
```

## When to Update Docs

- Add new feature → update guides/ and api/
- Change schema → update database.md and reference/types.md
- Add component → update reference/components.md
- Change architecture → update architecture.md
- Fix bug in docs → update relevant guide
