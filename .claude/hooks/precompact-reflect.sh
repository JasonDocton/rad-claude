#!/usr/bin/env bash
# PreCompact hook: Prompt for learning extraction before context is compressed
# Outputs a message that Claude sees, prompting reflection

cat << 'EOF'
──────────────────────────────────────────────────────────
PRECOMPACT REFLECTION

Before compacting, let's capture any learnings from this session:

1. **Gotchas discovered?** (unexpected behavior, edge cases, things that broke)
2. **Patterns worth documenting?** (approaches that worked well)
3. **Updates needed?** (CLAUDE.md, skills, rules)

If anything should become permanent knowledge, let's capture it now.
Otherwise, say "nothing to capture" and proceed.
──────────────────────────────────────────────────────────
EOF
