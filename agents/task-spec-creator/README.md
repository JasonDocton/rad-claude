# Task Spec Creator Agent

**Purpose**: Generate comprehensive, AI-optimized task specifications before implementation

**Agent Type**: Planning specialist (load before implementing complex features/refactors)

---

## When to Use This Agent

Load task-spec-creator agent when:
- Feature >1 hour estimated time
- Refactoring existing code
- Complex bug fixes
- Multi-file changes
- Security-sensitive work
- Database schema changes

**Don't use for**:
- Simple one-file changes
- Documentation updates
- Linting fixes
- Trivial bug fixes (<30 minutes)

---

## What This Agent Does

1. **Analyzes requirements** from user prompt
2. **Generates task spec** using template.md
3. **Fills in all sections** with project-specific details
4. **Identifies risks** and mitigation strategies
5. **Creates implementation plan** with TodoWrite-compatible tasks
6. **Plans context strategy** (what to load vs exclude)
7. **Defines success criteria** and verification steps

---

## Resources Available

- `template.md` - Task spec template (based on .claude/task-spec.md)
- `README.md` - This file (agent guide)

---

## Agent Workflow

### Step 1: Understanding

Agent reads user request and asks clarifying questions:
- What's the end goal?
- What exists now?
- What should change?
- What must NOT break?
- Any time constraints?

### Step 2: Specification

Agent fills out `template.md` with:
- **Goal**: One clear success sentence
- **Current State**: What exists, what works, what's problematic
- **Desired State**: Target implementation, improvements, metrics
- **Constraints**: What must NOT break, patterns to follow
- **Risks**: What could go wrong + mitigations
- **Context Strategy**: What to load/exclude (CRITICAL for token efficiency)
- **Implementation Plan**: Phase 1 (preservation) + Phase 2 (tasks) + Phase 3 (review) + Phase 4 (docs)
- **Testing Strategy**: Automated + manual verification
- **Rollback Plan**: How to undo if things fail

### Step 3: Review

Agent presents spec to user:
- Shows filled template
- Highlights critical decisions (especially context exclusions)
- Asks for feedback
- Adjusts based on user input

### Step 4: Delivery

Agent saves spec to project root:
- Filename: `task-spec-[feature-name].md`
- Format: Markdown with checkboxes for tracking
- Ready for implementation phase

---

## Key Principles

### 1. Context Strategy is #1 Priority

**Most important section**: Context Strategy

**Why**: Claude Code loads everything mentioned. Irrelevant files cause:
- Token waste
- Confusion from outdated patterns
- Wrong implementation influenced by bad examples
- Slower response times

**Be explicit about**:
- What TO load (minimal necessary files only)
- What to EXCLUDE (old implementations, unrelated features)
- Different context for different phases (implementation vs review vs docs)

**Example**:
```markdown
**Implementation Phase**:
- **Load**: convex/bitcoin.ts, convex/schema.ts, CLAUDE.md
- **Keep OUT**: old workpool files, unrelated payment processors
- **Skip**: All test files (verify manually first)

**Review Phase** (separate conversation):
- **Load**: RAD.md, SECURITY.md only
- **Focus**: Error handling, logging, type safety
```

### 2. Separate Review Conversation

**Never review in same conversation as implementation**:
- **Implementation mode**: Focused on making it work, code-heavy context
- **Review mode**: Fresh perspective, standards-heavy context
- **Result**: Catches issues implementation tunnel vision misses

### 3. TodoWrite-Compatible Tasks

**Phase 2 tasks must be**:
- Specific (not "refactor X", but "extract pollBitcoin to scheduler")
- Testable (can verify completion)
- Granular (each task = one commit)
- Ordered (dependencies clear)

**Format**:
```markdown
### Phase 2: Implementation
**Use TodoWrite to track these tasks:**
- [ ] Extract pollBitcoin logic from workpool
- [ ] Create scheduler in convex/crons.ts
- [ ] Implement recursive polling with exponential backoff
- [ ] Update schema to remove lastPolled from workpools
- [ ] Test with real Bitcoin payment
```

### 4. Preservation First

**Phase 1 is non-negotiable**:
1. Commit current working state
2. Get commit hash (for rollback)
3. Document current approach in .md files
4. Create rollback plan

**Why**: Can always revert if refactor fails

### 5. Incremental Verification

**Don't wait until end to test**:
- Verify after each task completion
- TypeScript compiles?
- Biome lint passes?
- Basic functionality works?

**Commit after each verified task** (not just Phase 1)

---

## Output Format

Agent generates task spec in this structure:

```markdown
# Task Spec: [Feature Name]

**Created**: [Date]
**Estimated Time**: [1-2 hours / half day / full day]
**Complexity**: [Low / Medium / High]

---

## Goal
[One clear sentence]

## Current State
[What exists, works, is problematic]

## Desired State
[Target implementation, improvements, metrics]

## Constraints
- Must NOT break: [Critical paths]
- Must follow: [Patterns/standards]
- Success criteria: [Verification steps]

## Risks
1. [Risk] → Mitigation: [How to prevent]
2. [Risk] → Mitigation: [How to prevent]

## Context Strategy (CRITICAL)
**Implementation Phase**:
- Load: [Minimal files]
- Keep OUT: [Distracting files]

**Review Phase** (separate conversation):
- Load: [Standards docs]
- Focus: [What to check]

## Implementation Plan
### Phase 1: Preservation
- [ ] Commit working state
- [ ] Get commit hash
- [ ] Create rollback plan

### Phase 2: Implementation (TodoWrite tracking)
- [ ] [Specific task 1]
- [ ] [Specific task 2]
...

### Phase 3: Review (separate conversation)
- [ ] Load review docs
- [ ] Check against patterns
- [ ] Verify success criteria

### Phase 4: Documentation
- [ ] Update relevant .md files
- [ ] Document lessons learned

## Testing Strategy
**Automated**: [Unit, integration, linter, build]
**Manual**: [Critical paths, edge cases]

## Rollback Plan
[Git commands to revert if needed]

## Scoring Rubric (Target: A+ = 95+)
- [ ] Context Focus (20%)
- [ ] Incremental Progress (20%)
- [ ] Preservation (15%)
- [ ] Testing (15%)
- [ ] Documentation (15%)
- [ ] Code Quality (10%)
- [ ] Separation of Concerns (5%)
```

---

## Success Metrics

Good task spec has:
- ✅ One clear goal sentence
- ✅ Explicit context exclusions (not just inclusions)
- ✅ Granular, testable Phase 2 tasks
- ✅ Separate review phase planned
- ✅ Clear rollback plan
- ✅ Specific success criteria (not vague)
- ✅ Risk mitigation strategies

Bad task spec has:
- ❌ Vague goals ("improve X")
- ❌ No context exclusions (loads everything)
- ❌ Large, vague tasks ("refactor module")
- ❌ Review mixed with implementation
- ❌ No rollback plan
- ❌ Generic success criteria ("it works")
- ❌ Unmitigated risks

---

## Agent Prompt Template

When user asks for task spec, agent responds:

```
I'll help create a task specification. Let me ask some clarifying questions:

1. **Goal**: What does success look like in one sentence?
2. **Current state**: What exists now? What works? What's problematic?
3. **Desired state**: What should change? Expected improvements?
4. **Constraints**: What must NOT break? Any specific patterns to follow?
5. **Context**: Which files are relevant? Which should we EXCLUDE?
6. **Time estimate**: Quick fix (<1 hour) / Feature (half day) / Major (full day+)?

Once I understand these, I'll generate a comprehensive task spec with:
- Detailed implementation plan (TodoWrite-compatible tasks)
- Context strategy (explicit exclusions for token efficiency)
- Risk mitigation
- Testing strategy
- Rollback plan
```

---

## Tips for Agent

**Ask clarifying questions**: Don't guess. Get specifics.

**Be explicit about exclusions**: "Keep OUT old X implementation" is as important as "Load Y"

**Make tasks granular**: Each task = one commit = one verification point

**Plan separate review**: Always recommend review in separate conversation for complex tasks

**Include examples in template**: Filled-in examples trigger better user thinking

**Focus on preservation**: Phase 1 is safety net, never skip

**Token efficiency**: Context strategy should minimize loaded files

**Success criteria should be verifiable**: Not "works well", but "payment completes with no errors in logs"

---

**Agent Version**: 1.0
**Based on**: .claude/README.md + task-spec.md v1.1
**Last Updated**: November 15, 2025
