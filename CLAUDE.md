# Project: rad-claude

## Stack

Bun, TypeScript, React 19, Tailwind 4, Convex

## Navigation

See `.claude/map.md` for project structure & key file locations.

## Conventions

- Named exports, no default exports
- Convex schema is single source of truth for types
- Convex is the backend; use framework functions only for routing

## Conflict Resolution

Files in `convex/` follow Convex patterns even for shared rules (e.g., snake_case overrides kebab-case).

## Gotchas

**timeout isn't available on macOS. Use gtimeout**
