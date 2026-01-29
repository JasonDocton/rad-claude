---
name: testing-patterns
description: Project test patterns. Applies when writing tests or mocking Convex.
---

# Testing

- Framework: Vitest + `bun test`
- Files: `*.test.ts` colocated with source
- Convex: use `convex-test` for backend tests
- Coverage: `bun test --coverage`

## Convex Mocking

```ts
import { convexTest } from "convex-test"
import schema from "./schema"

const t = convexTest(schema)
await t.run(async (ctx) => {
  // test mutations/queries here
})
```
