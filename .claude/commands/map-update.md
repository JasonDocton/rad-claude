---
description: Refresh project structure map after changes
---

Re-scan project and update `.claude/map.md`.

## Process

1. Read existing `.claude/map.md`
2. Scan current project structure
3. Identify what changed (new directories, moved files, new patterns)
4. Regenerate map preserving any manual annotations

## Output

Show diff summary before writing:

```
Map Update:
+ Added: src/features/ (new directory)
~ Moved: utils/ → src/lib/utils/
- Removed: src/old-components/ (deleted)
= Unchanged: convex/, src/styles/

Write updated map? (y/n)
```

## Guidelines

- **Preserve manual notes** — if human added context, keep it
- **Flag ambiguity** — "Found src/utils/ and src/lib/utils/ — which is canonical?"
- **Same constraints as init** — 30-50 lines, structure over files
