# Project Map

## Source of Truth

- `convex/schema.ts` → all types derive from here
- `src/styles/global.css` → Tailwind 4 theme (no tailwind.config)

## Backend (convex/)

- Pattern: `[domain]_mutations.ts`, `[domain]_queries.ts`
- Auth: `auth.ts`
- HTTP: `http.ts` (webhooks)
- Files use `snake_case`

## Frontend (src/)

- Components: `components/ui/` (shared), `components/[feature]/`
- Hooks: `hooks/`
- Utils: `utils/errors.ts`, `utils/logger.ts`
- Styles: `styles/global.css`
- Files use `kebab-case`

## Types

- `convex/types.ts` → derived from schema via `Infer<>`
- Frontend imports from `convex/types.ts`, never defines own

## Config

- `convex.json` — Convex project config
- `tsconfig.json` — strict mode
- `.oxlintrc.json`, `.oxfmtrc.json` — linting/formatting
