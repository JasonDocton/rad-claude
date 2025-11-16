# Skill Frontmatter Schema

Enhanced SKILL.md frontmatter for automatic skill activation and context-aware loading.

## Schema Definition

```yaml
---
name: skill-name                    # Required: Unique identifier
description: Brief description      # Required: One-line purpose
version: "1.0.0"                   # Optional: Semantic versioning

# Trigger Configuration
triggers:
  # Prompt-based triggers
  prompt:
    keywords:                       # Simple keyword matching
      - keyword1
      - keyword2
    semantic: "natural language description of when this skill applies"
    intentPatterns:                 # Regex patterns for intent matching
      - "(create|add|modify).*?pattern"
      - "intent.*?description"

  # File-based triggers
  files:
    include:                        # Glob patterns to match
      - "path/to/files/**/*.ts"
      - "convex/**/*.ts"
    exclude:                        # Glob patterns to exclude
      - "**/node_modules/**"
      - "**/*.test.ts"
    contentPatterns:               # Regex to match file content
      - "export.*?mutation\\("
      - "defineSchema\\("

  # Context-based triggers
  context:
    workingDir:                    # Auto-load when working in these dirs
      - "convex/"
      - "src/api/"
    recentFiles:                   # Auto-load if recently edited these patterns
      - "convex/**/*.ts"
    gitBranch:                     # Optional: Load only on specific branches
      - "main"
      - "feature/*"

# Enforcement Configuration
enforcement: suggest                # suggest | warn | block
priority: high                      # critical | high | medium | low

# Progressive Enforcement (optional)
progressive:
  enabled: true
  escalate: true                   # Escalate from suggest → warn → block
  maxIgnores: 2                    # Times user can ignore before escalation

# Metadata
tags:                              # Optional: For categorization
  - backend
  - database
  - validation
dependencies:                      # Optional: Other skills this depends on
  - typescript-patterns
  - security-patterns
---
```

## Field Descriptions

### Core Fields

- **name**: Unique identifier matching the skill directory name
- **description**: Brief one-line description shown in suggestions
- **version**: Semantic version for tracking changes (optional)

### Trigger Fields

#### `triggers.prompt`

Defines when to suggest this skill based on user prompts:

- **keywords**: Simple substring matching (case-insensitive)
- **semantic**: Natural language description for semantic matching (future: embedding-based)
- **intentPatterns**: Regex patterns for intent matching

#### `triggers.files`

Defines when to auto-load based on file operations:

- **include**: Glob patterns to match file paths
- **exclude**: Glob patterns to exclude (takes precedence)
- **contentPatterns**: Regex to match file content (for deeper detection)

#### `triggers.context`

Defines when to auto-load based on session context:

- **workingDir**: Auto-load when working directory matches
- **recentFiles**: Auto-load if recently edited files match patterns
- **gitBranch**: Optional filtering by git branch

### Enforcement Fields

- **enforcement**: How strictly to enforce skill usage
  - `suggest`: Show suggestion, allow proceeding without skill
  - `warn`: Show warning, allow proceeding with acknowledgment
  - `block`: Prevent operation until skill is loaded

- **priority**: Determines order in suggestion list
  - `critical`: Always show, highest priority
  - `high`: Show for clear matches
  - `medium`: Show for moderate matches
  - `low`: Show only for explicit matches

### Progressive Enforcement

Optional adaptive behavior:

- **enabled**: Turn on progressive enforcement
- **escalate**: Gradually increase enforcement level based on ignores
- **maxIgnores**: Number of times user can ignore before escalating

### Metadata

- **tags**: Categorization for filtering/search
- **dependencies**: Other skills that should be loaded together

## Confidence Scoring

The system assigns confidence scores based on trigger matches:

| Match Type | Base Confidence | Modifier |
|------------|----------------|----------|
| Keyword | 70% | +5% per additional keyword |
| Intent Pattern | 80% | +10% if multiple patterns match |
| File Include | 90% | -10% if exclude pattern also matches |
| Working Dir | 95% | Auto-load threshold |
| Recent Files | 85% | Context-based boost |

**Auto-load threshold**: 90%+ confidence
**Suggest threshold**: 70%+ confidence
**Hide threshold**: <70% confidence

## Examples

### Example 1: Convex Patterns (Strict)

```yaml
---
name: convex-patterns
description: Convex backend patterns with security and validation
version: "1.0.0"

triggers:
  prompt:
    keywords: [convex, mutation, query, action, schema]
    semantic: "creating or modifying Convex backend functions, database operations, or schemas"
    intentPatterns:
      - "(create|add|modify|build).*?(mutation|query|action)"
      - "convex.*?(function|schema|database)"
  files:
    include:
      - "convex/**/*.ts"
    exclude:
      - "convex/_generated/**"
    contentPatterns:
      - "export.*?(mutation|query|action)\\("
      - "defineSchema\\("
  context:
    workingDir: ["convex/"]
    recentFiles: ["convex/**/*.ts"]

enforcement: block
priority: critical

progressive:
  enabled: true
  escalate: true
  maxIgnores: 1

tags: [backend, database, validation, security]
dependencies:
  - typescript-patterns
  - security-patterns
---
```

### Example 2: React Patterns (Flexible)

```yaml
---
name: react-patterns
description: Modern React 19+ patterns with TypeScript
version: "1.0.0"

triggers:
  prompt:
    keywords: [react, component, hook, jsx, tsx]
    semantic: "creating or modifying React components, hooks, or UI patterns"
    intentPatterns:
      - "(create|build|add).*?(component|hook)"
      - "react.*?(pattern|state|effect)"
  files:
    include:
      - "src/**/*.tsx"
      - "components/**/*.tsx"
    exclude:
      - "**/*.test.tsx"
      - "**/*.stories.tsx"
    contentPatterns:
      - "export\\s+function.*?\\(.*?\\).*?{.*?return.*?<"
      - "useState|useEffect|useCallback|useMemo"
  context:
    workingDir: ["src/components/", "src/features/"]
    recentFiles: ["**/*.tsx"]

enforcement: suggest
priority: high

progressive:
  enabled: true
  escalate: false
  maxIgnores: 3

tags: [frontend, react, components]
dependencies:
  - typescript-patterns
---
```

### Example 3: Security Patterns (Always Warn)

```yaml
---
name: security-patterns
description: Security best practices for input validation and PII protection
version: "1.0.0"

triggers:
  prompt:
    keywords: [security, validation, auth, password, pii, encryption]
    semantic: "handling sensitive data, authentication, or security-critical operations"
    intentPatterns:
      - "(validate|sanitize|check).*?(input|data)"
      - "(auth|login|password|token).*?(check|verify|validate)"
  files:
    include:
      - "**/auth/**/*.ts"
      - "**/api/**/*.ts"
    contentPatterns:
      - "(password|token|secret|api[_-]?key)"
      - "auth\\.(get|check|verify)"
  context:
    workingDir: ["src/auth/", "convex/auth/"]

enforcement: warn
priority: critical

progressive:
  enabled: false  # Always warn, never escalate or de-escalate

tags: [security, validation, authentication]
---
```

## Migration Guide

### Updating Existing Skills

To update an existing SKILL.md:

1. Keep existing frontmatter fields (`name`, `description`)
2. Add `triggers` section based on skill's purpose
3. Set appropriate `enforcement` and `priority`
4. Test with various prompts/file contexts
5. Adjust confidence thresholds as needed

### Backward Compatibility

Skills without enhanced frontmatter will:
- Fall back to directory name matching
- Default to `enforcement: suggest`
- Default to `priority: medium`
- Never auto-load (must be manually invoked)

## Best Practices

1. **Start with keywords**: Easy to maintain, good coverage
2. **Add intent patterns gradually**: Based on observed usage
3. **Use file triggers for auto-loading**: Reduce manual activation
4. **Set enforcement appropriately**:
   - `block`: Only for critical patterns (security, database schema)
   - `warn`: For important but not blocking patterns
   - `suggest`: For helpful but optional patterns
5. **Enable progressive enforcement**: Adapts to user preferences
6. **Tag skills consistently**: Enables future filtering/search
7. **Document semantic descriptions clearly**: Prepare for embedding-based matching

## Future Enhancements

- Semantic matching using local embeddings (Xenova/transformers)
- Learning from usage patterns (analytics-driven trigger refinement)
- Confidence calibration based on user feedback
- Skill recommendation engine (suggest related skills)
- Cross-skill pattern detection (detect conflicting or complementary skills)
