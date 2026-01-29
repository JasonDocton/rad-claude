---
description: Safe-delete cycle for dead code removal
---

Run `npx knip --reporter json`, output analysis to `.reports/dead-code-analysis.md`.

## Categorization

| Level   | Criteria                                            | Action                      |
| ------- | --------------------------------------------------- | --------------------------- |
| SAFE    | Unused local exports, internal utils                | Auto-delete after test pass |
| CAUTION | Unused components, API routes, dynamic imports      | Human confirmation          |
| DANGER  | Configs, root files, type definitions, entry points | Log only, never delete      |

**Auto-promote to CAUTION:** Any string literal in `import()` or `require()`.

## Execution (Atomic)

For each SAFE item:

1. `bun test [related-file]` — skip if fail
2. Delete
3. `bun test` — revert on failure

## Output

Summary table: `File | Status | Lines Removed`
