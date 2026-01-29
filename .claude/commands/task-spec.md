---
description: Create a task spec for focused implementation work
---

Read `.claude/templates/task-spec.md` and help the user create a task spec.

## Process

1. **Clarify goal**: What does success look like in one sentence?
2. **Context strategy**: What files to load? What to explicitly exclude?
3. **Constraints**: What must not break? What patterns to follow?
4. **Risks**: What could go wrong?
5. **Checkpoint**: Remind to commit working state before starting

## Key Questions to Ask

- What's the one-sentence goal?
- What files do I need to understand this task?
- What files should I NOT load (would add noise)?
- What critical paths must not break?
- What's the rollback plan if this goes wrong?

## Output

Generate task spec at `tasks/[task-name].md` or directly in conversation if quick.

## When to Use

- Feature implementation with risk of breaking existing code
- Refactoring where rollback matters
- Complex changes touching multiple systems
- Any task where "what to load" and "what to exclude" isn't obvious

## When NOT Needed

- Simple questions
- Small isolated changes
- Exploratory conversations
- Tasks where full project context is fine
