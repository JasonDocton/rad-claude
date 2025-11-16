# Claude Code Skills

This directory contains skills for Claude Code's auto-activation system, providing context-aware development patterns.

## What Are Skills?

Skills are modular knowledge modules that Claude loads based on your current work context. They provide:
- **Modern patterns** for TypeScript, React 19, Convex, etc.
- **Security guidelines** to prevent vulnerabilities
- **Framework-specific** guidance for Next.js 16 and TanStack Start
- **Auto-activation** based on files and prompts

## Available Skills

| Skill | Type | When It Activates |
|-------|------|------------------|
| **naming-conventions** | Standard | Naming variables, functions, types |
| **typescript-patterns** | Domain | `.ts`, `.tsx` files |
| **react-patterns** | Domain | React components, hooks |
| **tailwind-patterns** | Domain | Files with `className=` |
| **security-patterns** | Guardrail | Security, validation, auth keywords |
| **convex-patterns** | Domain | `convex/` directory files |
| **bun-patterns** | Tooling | `bun.lockb`, `bunfig.toml` |
| **framework-patterns** | Domain | Next.js or TanStack Start files |

## Skill Structure

Each skill follows this pattern:

```
skill-name/
├── SKILL.md          # 50-100 line quick reference
└── resources/        # Detailed guides (loaded on demand)
    ├── topic-1.md
    ├── topic-2.md
    └── topic-3.md
```

### Progressive Disclosure

- **SKILL.md**: Quick reference with common patterns (fast to load)
- **resources/**: Detailed guides loaded only when needed (token efficient)

## How Skills Activate

### Automatic (Claude Code)

Skills auto-suggest based on:

1. **File patterns**: Editing `convex/orders.ts` → suggests `convex-patterns`
2. **Keywords**: Prompt contains "validation" → suggests `security-patterns`
3. **Content**: File has `mutation(` → suggests `convex-patterns`

Configured in `skill-rules.json`:

```json
{
  "skills": {
    "react-patterns": {
      "fileTriggers": {
        "pathPatterns": ["src/**/*.tsx", "components/**/*.tsx"]
      },
      "promptTriggers": {
        "keywords": ["component", "react", "hook"]
      }
    }
  }
}
```

### Manual (ZED, Cursor, Claude.ai)

Load skills explicitly:

**Claude Code**:
```
/skill react-patterns
```

**ZED**:
```
@rule react-patterns
```

**Cursor** (.cursor/rules/):
```
Convert SKILL.md to .mdc format
```

**Claude.ai**:
```
Upload SKILL.md file to conversation
```

## Skill Types

### Domain Skills

Context for specific technologies:
- `typescript-patterns`: TypeScript 5.9+ patterns
- `react-patterns`: React 19+ component patterns
- `convex-patterns`: Convex backend patterns
- `framework-patterns`: Next.js 16, TanStack Start v1

### Guardrail Skills

Security and best practices:
- `security-patterns`: Input validation, PII protection, crypto operations

### Standard Skills

General development patterns:
- `naming-conventions`: Consistent naming across codebase

### Tooling Skills

Build tools and package managers:
- `bun-patterns`: Bun package manager and runtime

## Using Skills Effectively

### 1. Let Auto-Activation Work

Trust the hooks system - skills will suggest themselves when relevant:

```
You: "Create an order mutation in Convex"
Hook: 📚 Suggested skills: convex-patterns security-patterns
Claude: [Loads both skills, provides secure Convex mutation pattern]
```

### 2. Load Multiple Related Skills

Complex tasks benefit from multiple skills:

```
Creating a new React component with Convex integration:
- react-patterns: Component structure, hooks
- typescript-patterns: Type safety
- convex-patterns: Data fetching patterns
- security-patterns: Input validation
```

### 3. Reference Resources When Needed

SKILL.md references resource files for deep dives:

```markdown
## Resource Files
- [Input Validation](resources/input-validation.md) - Comprehensive Zod patterns
- [PII Protection](resources/pii-protection.md) - Sanitization implementation
```

## Skill Development

### Creating a New Skill

1. **Create directory**:
   ```bash
   mkdir -p .claude/skills/my-skill/resources
   ```

2. **Create SKILL.md** with frontmatter:
   ```markdown
   ---
   name: my-skill
   description: Brief description
   ---

   # My Skill

   ## Purpose
   [Why this skill exists]

   ## When This Skill Activates
   [Trigger conditions]

   ## Quick Reference
   [Key patterns, 3-5 most important things]

   ## Common Patterns
   [Examples with ✅ DO and ❌ AVOID]

   ## Resource Files
   - [Deep Dive](resources/deep-dive.md)
   ```

3. **Add to skill-rules.json**:
   ```json
   {
     "skills": {
       "my-skill": {
         "type": "domain",
         "enforcement": "suggest",
         "priority": "medium",
         "fileTriggers": {
           "pathPatterns": ["**/*.myext"]
         },
         "promptTriggers": {
           "keywords": ["my-keyword"]
         }
       }
     }
   }
   ```

4. **Test**:
   ```bash
   # Validate JSON
   jq . .claude/skills/skill-rules.json

   # Test trigger
   CLAUDE_CODE_FILES="test.myext" \
   .claude/hooks/skill-activation-prompt.sh
   ```

### Skill Guidelines

**Keep SKILL.md concise** (50-100 lines):
- Quick reference format
- Common patterns with examples
- Link to resources for details

**Use progressive disclosure**:
- Don't repeat everything in SKILL.md
- Split detailed content into resource files
- Load resources only when needed

**Show modern patterns only**:
- React 19+ (no `React.FC`, no `defaultProps`)
- TypeScript 5.9+ (discriminated unions, `as const`)
- Current best practices (verify against latest docs)

**Provide clear examples**:
```tsx
// ✅ DO: Modern pattern
export function Button({ onClick }: ButtonProps) { }

// ❌ AVOID: Outdated pattern
const Button: React.FC<ButtonProps> = ({ onClick }) => { }
```

## Maintenance

### Regular Updates

1. **Verify patterns are current** (quarterly):
   - Check React docs for latest patterns
   - Check TypeScript release notes
   - Check Convex best practices
   - Update examples to match latest versions

2. **Review trigger effectiveness**:
   - Are skills suggesting at the right time?
   - Too many false positives?
   - Missing obvious triggers?

3. **Gather feedback**:
   - Which skills are most useful?
   - Which patterns are outdated?
   - What's missing?

### Version Control

- Commit skill changes with clear messages
- Tag major updates (e.g., `skills-v1.1`)
- Document breaking changes
- Keep changelog for skill updates

## Portability

### For Claude Code Users

Skills auto-activate via hooks - no action needed!

### For ZED Users

1. Import skills to Rules Library
2. Use `@rule skill-name` to load
3. See `.claude/skills/README.md` for details

### For Cursor Users

1. Convert SKILL.md to `.mdc` format
2. Place in `.cursor/rules/`
3. Load with `@skill-name`

### For Claude.ai Users

1. Navigate to `.claude/skills/skill-name/`
2. Upload `SKILL.md` to conversation
3. Upload resource files as needed

## Examples

### Example 1: Secure Convex Mutation

**Context**: Creating an order mutation

**Skills loaded**:
- `convex-patterns`: Mutation structure, authorization
- `security-patterns`: Input validation, PII handling

**Result**:
```ts
export const createOrder = mutation({
  args: {
    amount: v.number(),
    email: v.string()
  },
  handler: async (ctx, { amount, email }) => {
    // ✅ Authentication
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    // ✅ Validation
    if (amount <= 0 || amount > 1000000) {
      throw new Error('Invalid amount')
    }

    // ✅ Sanitized logging
    logger.info('order_created', sanitizeForLogging({
      user_id: identity.subject,
      amount,
      email // Will be removed by sanitizeForLogging
    }))

    return await ctx.db.insert("orders", { /* ... */ })
  }
})
```

### Example 2: React Component with TypeScript

**Context**: Creating a button component

**Skills loaded**:
- `react-patterns`: Component structure, props
- `typescript-patterns`: Type safety, readonly
- `naming-conventions`: Consistent naming

**Result**:
```tsx
interface ButtonProps {
  readonly variant: "primary" | "secondary"
  readonly onClick: () => void
  readonly disabled?: boolean
}

export function Button({ variant, onClick, disabled }: ButtonProps) {
  const handleClick = () => {
    if (!disabled) onClick()
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={variant === "primary" ? "btn-primary" : "btn-secondary"}
    >
      Click me
    </button>
  )
}
```

## Troubleshooting

### Skills Not Auto-Suggesting

1. **Check skill-rules.json**:
   ```bash
   jq . .claude/skills/skill-rules.json
   # Should output valid JSON
   ```

2. **Verify hooks are executable**:
   ```bash
   ls -la .claude/hooks/
   # Should show -rwx--x--x
   ```

3. **Test hook manually**:
   ```bash
   CLAUDE_CODE_FILES="src/App.tsx" \
   .claude/hooks/skill-activation-prompt.sh
   ```

4. **Check Claude Code settings**:
   ```json
   {
     "hooks": {
       "user-prompt-submit": {
         "command": ".claude/hooks/skill-activation-prompt.sh"
       }
     }
   }
   ```

### Skills Suggesting Too Often

Refine triggers in `skill-rules.json`:

```json
{
  "react-patterns": {
    "fileTriggers": {
      "pathPatterns": [
        "src/**/*.tsx",      // ✅ Specific
        "components/**/*.tsx" // ✅ Specific
      ]
      // ❌ NOT "**/*.tsx" (too broad)
    }
  }
}
```

## Resources

- [skill-rules.json](skill-rules.json) - Skill trigger configuration
- [Hooks README](../hooks/README.md) - How hooks work
- [Task Spec Template](../templates/task-spec.md) - Planning complex features

## Contributing

To add or improve skills:

1. Follow the SKILL.md format (50-100 lines)
2. Use progressive disclosure (resources/ for details)
3. Provide clear ✅ DO and ❌ AVOID examples
4. Verify patterns against latest docs
5. Test auto-activation triggers
6. Update skill-rules.json
7. Submit PR with clear description
