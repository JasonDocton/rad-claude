---
name: typescript-patterns
description: TypeScript style and type safety patterns. Applies to TSX, TS code, interfaces, types, generics, unions, type errors.
---

# TypeScript Patterns

## Rules (always apply)

| Pattern       | Do                             | Don't               |
| ------------- | ------------------------------ | ------------------- |
| Object shapes | `interface`                    | `type`              |
| Composition   | `interface extends`            | `type &`            |
| Unions        | discriminated, <10 members     | bag of optionals    |
| Constants     | `as const` objects             | `enum`              |
| Imports       | `import type { T }`            | `import { type T }` |
| Return types  | explicit on exports            | infer (except JSX)  |
| Validation    | `satisfies`                    | manual annotation   |
| Data          | `readonly` default             | mutable default     |
| Mutation      | spread operator                | direct mutation     |
| Async         | `Promise.all` when independent | sequential awaits   |

## Before Creating Any Type

1. Does it exist in schema/API?
2. Can I derive it?
3. Am I the source of truth?

For Convex: see `convex-patterns/SKILL.md`.

## Discriminated Unions

```ts
// ✅
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

// ❌ allows impossible states
type AsyncState<T> = { status: string; data?: T; error?: Error }
```

## satisfies for Validation

```ts
// ✅ validates + infers literal types
return { type, severity, description } satisfies Partial<FraudFlag>

// ❌ loses inference
function createConfig(): Partial<Config> { return { timeout: 5000 } }
```

## Explicit undefined vs Optional

```ts
// ✅ forces acknowledgment
interface CreateUser { referrerId: string | undefined }

// ❌ silent omission possible
interface CreateUser { referrerId?: string }
```

## interface extends > type &

```ts
// ✅ cached, flat
interface ButtonProps extends BaseProps, InteractiveProps {
  variant: "primary" | "secondary"
}

// ❌ recursive merge, slow
type ButtonProps = BaseProps & InteractiveProps & { variant: "primary" | "secondary" }
```

Use `&` only for: `type A = (B | C) & D`

## as const > enum

```ts
// ✅ tree-shakeable, no runtime
const Status = { Pending: "pending", Active: "active" } as const
type Status = (typeof Status)[keyof typeof Status]

// ❌ generates runtime code
enum Status { Pending = "pending" }
```

## Immutability

```ts
// ✅ spread
const updated = { ...user, name: "New" }
const added = [...items, newItem]

// ❌ mutation
user.name = "New"
items.push(newItem)
```

## Parallel Async

```ts
// ✅ parallel
const [users, markets] = await Promise.all([fetchUsers(), fetchMarkets()])

// ❌ sequential (when independent)
const users = await fetchUsers()
const markets = await fetchMarkets()
```

## Large Unions (>10 members)

```ts
// ❌ O(n²)
type Status = "pending" | "processing" | "confirmed" | "shipped" | ...

// ✅ nested
type Status =
  | { category: "active"; state: "pending" | "processing" }
  | { category: "completed"; state: "delivered" | "shipped" }
```

## Exhaustiveness Checking

```ts
switch (state.status) {
  case "success": return ...
  default: {
    const _exhaustive: never = state
    throw new Error("Unhandled state")
  }
}
```

## Extract Complex Conditionals

```ts
// ❌ recalculated
interface Api<T> { fetch<U>(x: U): U extends TypeA<T> ? ProcessA<U, T> : U }

// ✅ cached
type FetchResult<U, T> = U extends TypeA<T> ? ProcessA<U, T> : U
interface Api<T> { fetch<U>(x: U): FetchResult<U, T> }
```

## When type is Correct

- Unions: `type Result = Success | Error`
- Mapped types: `type Readonly<T> = { readonly [K in keyof T]: T[K] }`
- Conditionals: `type Unwrap<T> = T extends Promise<infer U> ? U : T`
- Tuples: `type Pair = [string, number]`
- Schema derivation: `type User = Infer<typeof userValidator>`
- Generic constraints needing index signatures
