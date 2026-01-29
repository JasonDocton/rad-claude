---
description: Generate initial project structure map for navigation
---

Scan the project and generate `.claude/map.md` — a structural reference for navigation.

## Process

1. Read top-level structure and key config files (package.json, tsconfig, etc.)
2. Identify organizational patterns (where do components live, how are files named)
3. Identify source-of-truth files (schema, types, main configs)
4. Map key directories by domain/purpose

## Output Format

Generate `.claude/map.md`:

```markdown
# Project Map

## Source of Truth

[Files that other files derive from — schema, core types, theme config]

## Backend

[Server-side code organization — patterns, key files]

## Frontend

[Client-side organization — components, hooks, utils, styles]

## Config

[Build, lint, TypeScript, environment]

## Patterns

[Naming conventions, file organization rules observed]
```

## Guidelines

- **~30-50 lines max** — navigation aid, not documentation
- **Structure over files** — map directories and patterns, not every file
- **Note relationships** — "types.ts derives from schema.ts"
- **Capture conventions** — "backend uses snake_case, frontend uses kebab-case"
- **Skip obvious** — node_modules, .git, lock files

## After Generation

Suggest adding to CLAUDE.md:

```markdown
## Navigation

See `.claude/map.md` for project structure.
```
