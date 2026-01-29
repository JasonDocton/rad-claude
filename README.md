<div align="center">
  <img src="https://res.cloudinary.com/df23ubjbb/image/upload/v1635199620/Github/RAD_Logo.png" width="32" />
  <h1>RAD AI</h1>
  <h3>Collaborative Claude Code skills and patterns</h3>

  <a href="https://claude.ai/">
    <img width="32px" alt="claude" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Claude_AI_symbol.svg/1200px-Claude_AI_symbol.svg.png">
  </a>
  <a href="https://docs.anthropic.com/en/docs/claude-code">
    <img width="32px" alt="claude code" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Claude_AI_symbol.svg/1200px-Claude_AI_symbol.svg.png">
  </a>
  <a href="https://bun.com">
    <img width="32px" alt="bun" src="https://bun.sh/logo.svg" />
  </a>
</div>

---

## Philosophy

**This is not a rules enforcement system.** After spending a lot of time working with Claude Code, I've come to realize that taking a collaborative mindset is far more effective than forcing Claude Code to follow explicit rules and guidelines. Many similar repos to this include massive skill files, rule files, and other instructions that add a great deal of context bloat without actually providing anything Claude Code doesn't already know. Specifing things like DRY, clean code, YAGNI, etc, don't add any value- Claude Code knows and does this already. Just as well, I've found it to be far more effective to manage any concerns in code quality via review, rather than forcing Claude Code to build with guardrails it doesn't need. This repo doesn't have Cialdini's influence principles or other gimmicks that give the illusion of control at the cost of context, tokens, and better results.

**A way to grow as a developer through collaboration.** When you take a collaborative approach to Claude Code, it in return asks better questions, gives better answers, and builds better systems. With more liberal guidelines and broader patterns, Claude Code is able to provide better insight, hold more holistic views, and better assess the greater outcomes. My approach is to do good research via the research-plan.md, utilize the task-spec.md alongside Claude's native planner, and continue on.

rad-claude exists to provide **knowledge Claude doesn't have**: project-specific patterns, recent API changes, and conventions that differ from common practice.

| Approach           | Ceiling         |
| ------------------ | --------------- |
| Prescriptive rules | What was scoped |
| Collaboration      | What emerges    |

### The Test

Before adding anything, ask: **"Would Claude get this wrong without it?"**

| Content                            | Passes? | Why                                      |
| ---------------------------------- | ------- | ---------------------------------------- |
| Custom Tailwind palette location   | ✅ Yes  | Project-specific, can't infer            |
| Convex snake_case file requirement | ✅ Yes  | Differs from JS convention, deploy fails |
| React 19 `useEffectEvent`          | ✅ Yes  | Newer than most training data            |
| "Write readable code"              | ❌ No   | Claude already knows                     |
| "Use try/catch for errors"         | ❌ No   | Claude already knows                     |

### Prevention vs Review

**Prevention mindset:** Force Claude to never make mistakes
→ Complex rules, enforcement, guardrails
→ Token-heavy, maintenance burden, still misses edge cases

**Review mindset:** Collaborate, then review before shipping
→ Light context, fast iteration, catch issues in review
→ Human judgment where it matters

The goal isn't to replace human judgment — it's to amplify it.

---

## What's Included

```
rad-claude/
├── CLAUDE.md                    # Project context (~20 lines)
├── .claude/
│   ├── skills/                  # 8 lean skills
│   │   ├── convex-patterns/     # Backend patterns, type derivation
│   │   ├── react-patterns/      # React 19 primitives
│   │   ├── typescript-patterns/ # Type safety patterns
│   │   ├── bun-patterns/        # Bun runtime specifics
│   │   ├── tailwind-patterns/   # Tailwind 4, theme location
│   │   ├── naming-conventions/  # File/variable naming
│   │   ├── testing-patterns/    # Vitest, Convex mocking
│   │   └── webfetch-patterns/   # Gemini CLI for blocked sites
│   ├── commands/                # Slash commands
│   │   ├── map-init.md          # Generate project map
│   │   ├── map-update.md        # Refresh project map
│   │   ├── research-plan.md     # Create research plans
│   │   ├── task-spec.md         # Create task specifications
│   │   └── clean.md             # Dead code analysis
│   ├── templates/               # Reusable templates
│   │   ├── research-plan.md     # Research plan structure
│   │   └── task-spec.md         # Task spec structure
│   ├── hooks/                   # Automation hooks
│   │   └── precompact-reflect.sh # Capture learnings before compaction
│   └── map.md                   # Project structure reference
└── thinking.md                  # Development notes
```

---

## Skills

Skills load automatically based on context. Each contains only knowledge Claude doesn't have by default.

| Skill                 | Purpose          | Knowledge Delta                                                         |
| --------------------- | ---------------- | ----------------------------------------------------------------------- |
| `convex-patterns`     | Backend patterns | Type derivation, snake_case files, validators, `_creationTime` indexing |
| `react-patterns`      | React 19+        | `useEffectEvent`, `useActionState`, `Activity`, `use()`                 |
| `typescript-patterns` | Type safety      | Discriminated unions, `as const`, interface vs type                     |
| `bun-patterns`        | Bun runtime      | `Bun.file()`, `Bun.Glob`, `node:` protocol                              |
| `tailwind-patterns`   | Tailwind 4       | No config file, `src/global.css` theme location                         |
| `naming-conventions`  | Naming           | Convex snake_case override, kebab-case files                            |
| `testing-patterns`    | Testing          | Vitest setup, `convex-test` mocking                                     |
| `webfetch-patterns`   | Web access       | Gemini CLI bridge for blocked sites                                     |

### Skill Design Principles

1. **Token-lean**: Average ~100 lines per skill
2. **High signal**: Only patterns that change behavior
3. **YAML-triggered**: Load based on context, not always-on
4. **Progressive**: Reference resources for deep dives

---

## Commands

| Command          | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `/map-init`      | Generate initial `.claude/map.md` with project structure  |
| `/map-update`    | Refresh map after significant changes                     |
| `/research-plan` | Create structured research plans for complex topics       |
| `/task-spec`     | Define focused implementation tasks with context strategy |
| `/clean`         | Analyze dead code with knip, categorize by removal safety |

---

## Hooks

### PreCompact Reflection

Fires before context compaction to capture learnings:

```bash
# .claude/hooks/precompact-reflect.sh
# Prompts Claude to document:
# 1. Gotchas discovered
# 2. Patterns worth documenting
# 3. Updates needed (CLAUDE.md, skills, rules)
```

This extracts value from full context before compression — discoveries that emerged from work, not planned upfront.

---

## Installation

### For Your Project

Copy the `.claude/` directory to your project root:

```bash
cp -r rad-claude/.claude /path/to/your/project/
```

Customize `CLAUDE.md` with your project's stack and conventions.

### Skills Only

Copy individual skills to Claude Code's global skills:

```bash
cp -r rad-claude/.claude/skills/* ~/.claude/skills/
```

---

## Token Efficiency

| Component       | Tokens   | Notes                           |
| --------------- | -------- | ------------------------------- |
| CLAUDE.md       | ~100     | Always loaded                   |
| Single skill    | ~200-400 | Loaded on context match         |
| All skills      | ~2,000   | Never all at once               |
| Typical session | ~500-800 | CLAUDE.md + 1-2 relevant skills |

Compare to prescriptive approaches: 5,000-10,000+ tokens of rules loaded every session.

---

## The Reframe

| Concern                                     | Reality                                |
| ------------------------------------------- | -------------------------------------- |
| "I didn't write it, so I can't maintain it" | Claude can explain, refactor, fix      |
| "It might do something unexpected"          | Review it. Ask Claude to explain it.   |
| "I'll lose control of my codebase"          | Control through review, not authorship |
| "What if Claude makes mistakes?"            | Same as any collaborator — you review  |

| Old Identity         | New Identity                  |
| -------------------- | ----------------------------- |
| "I write code"       | "I ship products"             |
| "I control the tool" | "I collaborate with the tool" |
| "My value is output" | "My value is my judgment"     |

---

## Support

- **Issues**: [GitHub Issues](https://github.com/jasondocton/rad-claude/issues)
- **Discord**: jasondocton

**[Consider Sponsoring YouAreRAD](https://github.com/sponsors/youarerad)**: Just $30 helps our non-profit cover the cost of mental health care for someone in need.

---

<div align="center">
  <img src="https://res.cloudinary.com/df23ubjbb/image/upload/v1635199620/Github/RAD_Logo.png" width="32" />
</div>
