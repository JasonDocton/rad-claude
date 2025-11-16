# Changelog

All notable changes to the rad-claude MCP server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-15

### Added
- **Semantic skill detection** with content scoring (30% weight)
  - Regex-based pattern matching for intent understanding
  - 8 semantic pattern categories (webhook/callback, payment/stripe, auth/session, etc.)
  - User can say "webhook" without "convex" and system still detects convex-patterns
- **41 semantic keywords** added across 4 skills for better detection
  - security-patterns: +11 keywords (signature, verify, encrypt, jwt, oauth, etc.)
  - react-patterns: +9 keywords (form, input, validation, props, children, etc.)
  - typescript-patterns: +13 keywords (guard, narrowing, Partial, Pick, Omit, etc.)
  - framework-patterns: +8 keywords (api, endpoint, middleware, router, etc.)
- **Zero token overhead** when not triggered (tools live in system context)
- **6 MCP tools** for progressive disclosure:
  - `get_relevant_skills` - Match skills with weighted confidence scoring
  - `suggest_agent` - Recommend specialized agents for complex tasks
  - `get_skill_resources` - Progressive resource loading
  - `update_session_tracker` - Track session progress
  - `should_create_checkpoint` - Checkpoint recommendations
  - `create_continuation_brief` - AI-optimized continuation briefs
- **8 rad-claude skills** with AI-optimized format:
  - bun-patterns, convex-patterns, framework-patterns, naming-conventions
  - react-patterns, security-patterns, tailwind-patterns, typescript-patterns
- **HTTP Actions documentation** in convex-patterns
  - CONVEX_SITE_URL vs CONVEX_URL distinction
  - Webhook setup with signature verification
  - Event deduplication patterns
- **Session management** for context preservation
- **Security validation** with path restrictions and symlink resolution
- **Token efficiency** - 27% reduction in skill content, compact tool responses

### Changed
- Optimized all skills for token efficiency (2,079 → 1,510 lines = 27% reduction)
- Compact tool response format (50-200 tokens vs thousands for verbose responses)
- Updated confidence scoring to use optional chaining
- Organized archive structure (reports/, task-specs/, docs/, tests/)

### Fixed
- Content scoring now active (was placeholder returning 0)
- Semantic detection working for webhook prompts (>70% confidence)
- Biome linting issues resolved
- Import organization and code formatting

### Documentation
- Comprehensive README.md with installation for all MCP clients
- Token Efficiency section explaining zero overhead
- 8 skill SKILL.md files with quick reference tables
- Task spec creator agent with template
- OPTIMIZATION_SUMMARY.md with lessons learned

### Security
- Multi-layer path validation (Zod → normalization → symlink resolution → allowlist)
- File access restricted to project directory
- Sanitized error messages to prevent information disclosure

## [Unreleased]

### Planned
- Additional skills as needed
- Performance optimizations
- Enhanced semantic patterns
- Community contributions

---

[1.0.0]: https://github.com/rad-claude/mcp-server/releases/tag/v1.0.0
