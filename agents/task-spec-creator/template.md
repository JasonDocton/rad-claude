# Task Spec: [Feature/Fix Name]

**Created**: [Date]
**Estimated Time**: [1-2 hours / half day / full day]
**Complexity**: [Low / Medium / High]

---

## Goal

[One clear sentence: what does success look like?]

E.g.: Eliminate console spam from Bitcoin payment monitoring while preserving all functionality.

---

## Current State

**What exists now**:
- [Current implementation details]
- [What works well]
- [What's problematic]

E.g.: Workpool-based polling works but logs ERROR every 10s | All features functional | Console spam degrades DX

---

## Desired State

**What should exist after**:
- [New implementation approach]
- [Expected improvements]
- [Success metrics]

E.g.: Scheduler-based recursive polling | Clean logs | Same functionality, better DX | No console spam

---

## Constraints

**Must NOT break**:
- [ ] [Critical path 1]
- [ ] [Critical path 2]
- [ ] [Critical path 3]

**Must follow**:
- [ ] RAD.md patterns (if code changes)
- [ ] SECURITY.md rules (if security-sensitive)
- [ ] TypeScript strict mode
- [ ] Biome linting rules

**Success criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

E.g.: Must NOT break: Payment detection, confirmations, donations | Must follow: RAD.md error handling | Success: Real Bitcoin payment completes with no console spam

---

## Risks

**What could go wrong**:
1. [Risk 1] → Mitigation: [How to prevent/handle]
2. [Risk 2] → Mitigation: [How to prevent/handle]

E.g.: Schema change breaks pending payments → Test with existing data | Scheduler concurrency issues → Review docs, test multiple payments | Bugs introduced → Commit working state first, enable rollback

---

## Context Strategy

**Implementation Phase**:
- **Load**: [Minimal context - which files?]
- **Keep OUT**: [Files that might confuse/distract]
- **Skip**: [What to avoid loading?]

**Review Phase** (separate conversation?):
- **Load**: [Review docs - which standards?]
- **Focus**: [What to check?]

**Documentation Phase**:
- **Update**: [Which docs need changes?]
- **Preserve**: [What lessons to document?]

E.g.: Implementation: Load CLAUDE.md + convex/bitcoin.ts + schema | Keep OUT: Old workpool files | Review: Separate convo, load RAD.md + SECURITY.md | Docs: Update bitcoin.md + PAYMENT_FLOWS.md

---

## Implementation Plan

### Phase 1: Preservation (2-5 minutes)
- [ ] Commit current working state (get commit hash)
- [ ] Document current approach in relevant .md files
- [ ] Create rollback plan (note git commit hash)

### Phase 2: Implementation (main work)
**Use TodoWrite to track these tasks:**
- [ ] [Task 1 - specific, testable]
- [ ] [Task 2 - specific, testable]
- [ ] [Task 3 - specific, testable]
- [ ] [Task 4 - specific, testable]
- [ ] [Task 5 - specific, testable]

**During Implementation**:
- Mark tasks: `not_started` → `in_progress` → `completed`
- Commit after each completed task (not just Phase 1)
- Verify incrementally (see below)

**Verification after each task**:
- [ ] TypeScript compiles
- [ ] Biome lint passes
- [ ] Incremental test (if applicable)

### Phase 3: Review (separate conversation if complex)
- [ ] Load review docs (RAD.md, SECURITY.md, etc.)
- [ ] Check code against patterns
- [ ] Run automated tests
- [ ] Manual verification of critical paths

### Phase 4: Documentation
- [ ] Update relevant .md files
- [ ] Document lessons learned
- [ ] Update AI_WORKFLOW.md if new patterns discovered
- [ ] Final commit with summary

---

## Testing Strategy

**Automated**:
- [ ] Unit tests: [What to test]
- [ ] Integration tests: [What to test]
- [ ] Linter: `pnpm biome check`
- [ ] Build: `pnpm build`

**Manual**:
- [ ] Test critical path 1
- [ ] Test critical path 2
- [ ] Test edge case 1

E.g.: Test real Bitcoin payment generation → confirmation → donation | Verify no console spam during 24h monitoring | Test multiple concurrent donations

---

## Rollback Plan

**If things go wrong**:
```bash
# Rollback to preserved state
git log --oneline  # Find commit hash before refactor
git revert [commit-hash]

# Or start over
git reset --hard [commit-hash]
```

**Preserved state location**: [git commit hash will go here after Phase 1]

---

## Scoring Rubric (Target: A+ = 95+)

Track yourself against these criteria:

- [ ] **Context Focus (20%)**: Only loaded relevant files, explicitly excluded distracting files
- [ ] **Incremental Progress (20%)**: TodoWrite used, tasks marked completed, commits after each task
- [ ] **Preservation (15%)**: Committed working state before changes
- [ ] **Testing (15%)**: Verified incrementally, not just at end
- [ ] **Documentation (15%)**: Updated all relevant docs with lessons
- [ ] **Code Quality (10%)**: Linter passing, no TypeScript errors
- [ ] **Separation of Concerns (5%)**: Implementation/review in separate phases

---

## Post-Task Review

**What went well**:
- [Fill in after completion]

**What could be better**:
- [Fill in after completion]

**Lessons learned**:
- [Fill in after completion]

**Time actual vs estimated**:
- Estimated: [from top of doc]
- Actual: [fill in after]
- Variance: [faster/slower, why?]

**Template improvements needed**:
- [What would make this template better next time?]

---

**Template Version**: 1.1
**Based on**: AI_WORKFLOW.md v1.1 (October 28, 2025)
**Last Updated**: November 12, 2025
