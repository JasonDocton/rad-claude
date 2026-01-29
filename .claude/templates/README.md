# Templates

## task-spec.md

Template for focused implementation tasks with context control.

### When to Use

- Feature implementation with risk of breaking existing code
- Refactoring where rollback matters
- Complex changes touching multiple systems
- Any task where "what to load" and "what to exclude" isn't obvious

### When NOT Needed

- Simple questions or small isolated changes
- Exploratory conversations
- Tasks where full project context is fine

### How to Use

1. Run `/task-spec` to scaffold interactively, OR
2. Copy template and fill manually

### Key Principle

**Context Strategy is the core value.** The Load/Exclude sections tell Claude exactly what context matters — preventing both "searching for files" and "drowning in irrelevant context."

### Structure

```
Goal → Context Strategy → Constraints → Risks → Rollback
```

---

## research-plan.md

Template for deep research tasks with Claude's research mode.

### When to Use

- Multi-section research requiring synthesis across sources
- Research building on existing work/files
- Tasks where output format matters (equations, comparisons, analyses)
- Complex topics benefiting from prioritization

### When NOT Needed

- Quick factual questions
- Research without existing reference materials
- Topics where output format doesn't matter

### How to Use

1. Run `/research-plan` to scaffold interactively, OR
2. Copy template and fill manually

### Key Principles

**Reference mapping**: Every section points to existing source material. Claude reads the reference first, then researches what's missing.

**Example-driven output**: Show exactly what good output looks like. "Provide equations with parameters" is vague. An actual example equation with parameters is clear.

**Prioritized sections**: Deep research may not complete fully. Priority order ensures partial completion is still useful.

**Concrete deliverables**: Each subsection ends with a specific deliverable, not "research this topic."

### Structure

```
Context → Reference Map → Sections → Output Format → Priority → Sources
```

Each section:

```
Reference file → What's needed → Open questions → Deliverable
```

---

## Comparison

| Aspect      | task-spec              | research-plan       |
| ----------- | ---------------------- | ------------------- |
| Purpose     | Implementation         | Investigation       |
| Length      | ~30 lines              | ~100+ lines         |
| Context     | Load/Exclude files     | Reference materials |
| Output      | Code changes           | Research document   |
| Risk focus  | Breaking existing code | Incomplete coverage |
| Key feature | Context Strategy       | Priority Order      |
