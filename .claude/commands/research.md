---
description: Create a new research plan from template
---

Read `.claude/templates/research-plan.md` and help the user create a research plan for their topic.

## Process

1. **Clarify scope**: Ask what they're researching and why
2. **Identify constraints**: Target platform, existing work, limitations
3. **Map sources**: What reference materials exist? What gaps remain?
4. **Define deliverables**: What format should outputs take?
5. **Prioritize**: If limited time, what matters most?

## Key Questions to Ask

- What prior research exists that this builds on?
- What specific outputs do you need? (equations, summaries, comparisons, etc.)
- What does "good output" look like? Can you show an example?
- What reference files should I read before researching?
- What's the priority order if we can't cover everything?

## Output

Generate a research plan at `research/[topic]-research-plan.md` following the template structure.

## Quality Markers

A good research plan:

- Maps every section to existing reference material
- Shows example output format (not just describes it)
- Has clear deliverables per subsection
- Prioritizes so partial completion is still useful
- Identifies open questions, not just "find information"
