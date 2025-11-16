---
name: typescript-patterns
description: Modern TypeScript patterns for type safety and maintainability
---

# TypeScript Patterns

**Purpose**: Maximize type safety, prevent runtime errors, leverage TypeScript 5.9+ features

- Keywords: typescript, type, interface, generic, utility type, discriminated union, as const, readonly, validation, narrowing, guard, type guard, assert, enum, tuple, Record, Partial, Pick, Omit, infer, extends

## Quick Reference

| Pattern | ✅ Prefer | ❌ Avoid |
|---------|-----------|----------|
| Type sources | Single source of truth | Duplicate types |
| Convex types | `Doc<"table">` in types.ts | Types in schema.ts |
| Object shapes | `interface` | `type` (ok for simple) |
| Composition | `interface extends` | `type &` (proven slower) |
| Union types | Discriminated unions | Bag of optionals |
| Union size | <10 members | Large unions (slow) |
| Constants | `as const` objects | `enum` |
| Imports | `import type { T }` | `import { type T }` |
| Return types | Explicit annotations | Always infer (slow) |
| Optionality | `\| undefined` (critical) | `?` (everything) |
| Readonly | Default for data | Mutable everywhere |

## Discriminated Unions

```ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

function render(state: AsyncState<User>) {
  switch (state.status) {
    case "idle": return <Idle />
    case "loading": return <Spinner />
    case "success": return <UserCard user={state.data} />
    case "error": return <Error error={state.error} />
  }
}

// ❌ Bag of optionals (allows impossible states)
type AsyncState<T> = {
  status: string
  data?: T        // Can have both data AND error
  error?: Error
}
```

## Explicit undefined (Critical Fields)

```ts
// ✅ Forces explicit value
interface CreateUser {
  userId: string | undefined  // Must pass
}
createUser({ name: "...", userId: undefined })

// ❌ Optional (too easy to forget)
interface CreateUser {
  userId?: string
}
createUser({ name: "..." })  // Silently omits userId
```

## Import Type

```ts
import type { User, Order } from "./models"
// Guaranteed erased at runtime, no bundle impact
```

## as const > enum

```ts
// ✅ Tree-shakeable, no runtime code
const PaymentMethod = {
  Card: "card",
  Bitcoin: "bitcoin"
} as const

type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

// ❌ Generates runtime code
enum PaymentMethod { Card = "card" }
```

## readonly by Default

```ts
interface User {
  readonly id: string
  readonly email: string
}

// Mutable only when it genuinely changes
interface FormState {
  amount: string        // User edits
  isSubmitting: boolean // Changes
}
```

## Single Source of Truth

**Check for source of truth before creating new types.**

### Convex Projects

Type sources:
- `convex/schema.ts` - Database schema (source of truth)
- `convex/types.ts` - Derived/additional types

```ts
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"))
  }).index("by_email", ["email"])
})

// convex/types.ts
import type { Doc } from "./_generated/dataModel"

export type User = Doc<"users">  // Derive from schema
export type UserStatus = User["status"]  // Extract

// Non-schema types
export interface UserWithOrders extends User {
  readonly orders: Order[]
}
```

**Rules**:
1. Never add non-schema types to `schema.ts`
2. Export schema types from `convex/types.ts` using `Doc<"table">`
3. Build derived types from schema
4. Use `convex/types.ts` for API responses, UI state

### Non-Convex Projects

Sources:
- Database: `src/db/schema.ts` or ORM types
- API: Backend-generated (OpenAPI, tRPC)
- UI: Derive from API/DB

```ts
// src/db/schema.ts
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull()
})

export type User = typeof users.$inferSelect

// src/types/ui.ts
export interface UserListItem extends Pick<User, 'id' | 'name'> {
  readonly orderCount: number
}
```

**Before creating a type**:
1. Does it exist in schema/API?
2. Can I derive it?
3. Am I the source of truth?

## interface for Objects

```ts
// ✅ Preferred (consistent, extendable, better errors)
interface User {
  readonly id: string
  readonly name: string
}

// ✅ Also OK
type User = { readonly id: string; readonly name: string }
```

**Use `type` for**:
- Unions: `type Status = "pending" | "confirmed"`
- Conditionals: `type ReturnType<T> = ...`
- Mapped: `type Partial<T> = ...`
- Primitives: `type ID = string`
- Tuples: `type Point = [number, number]`

## interface extends (Proven Faster)

Sentry case study: `interface extends` eliminated "couple of seconds" IDE lag vs `type &`

```ts
// ✅ Fast (cached, flat)
interface ButtonProps extends BaseProps, InteractiveProps {
  readonly variant: "primary" | "secondary"
}

// ❌ Slow (recursive merge, not cached)
type ButtonProps = BaseProps & InteractiveProps & {
  variant: "primary" | "secondary"
}
```

**Use `&` only for**:
- Union combos: `type A = (B | C) & D`
- Partial intersections: `type A = Partial<B> & C`

## Explicit Return Types

Annotate exported functions (prevents `import()` paths in .d.ts, faster)

```ts
// ✅ Explicit
export function getOrders(userId: string): Order[] {
  return db.query.orders.where(eq(orders.user_id, userId))
}

// ❌ Inferred (may generate import() in .d.ts)
export function getOrders(userId: string) {
  return db.query.orders.where(eq(orders.user_id, userId))
}
```

**Annotate**: Exported functions, complex returns
**Inference OK**: Private functions, simple returns

## Large Unions (Avoid >10 members)

>10 members = O(n²) type checking. Restructure with discriminated unions.

```ts
// ❌ Slow (14 members = 91 comparisons)
type Status = "pending" | "processing" | "confirmed" | "shipped"
  | "delivered" | "cancelled" | "refunded" | "failed"
  | "expired" | "on_hold" | "reviewing" | "approved"
  | "rejected" | "archived"

// ✅ Fast (nested discriminated)
type Status =
  | { category: "active"; state: "pending" | "processing" | "confirmed" }
  | { category: "completed"; state: "delivered" | "shipped" }
  | { category: "cancelled"; state: "cancelled" | "refunded" | "failed" }
```

**Rule**: <5 fast, 5-10 ok, >10 restructure

## Extract Conditionals

TypeScript caches named types.

```ts
// ❌ Recalculated every call
interface Api<T> {
  fetch<U>(x: U): U extends TypeA<T> ? ProcessA<U, T> : U
}

// ✅ Cached
type FetchResult<U, T> = U extends TypeA<T> ? ProcessA<U, T> : U
interface Api<T> {
  fetch<U>(x: U): FetchResult<U, T>
}
```

## noUncheckedIndexedAccess

With `noUncheckedIndexedAccess: true`, indexed access returns `T | undefined`

```ts
const users: User[] = [...]

// ✅ Check before use
const first = users[0]
if (first !== undefined) console.log(first.name)

// ✅ Optional chaining
const name = users[0]?.name

// ✅ Nullish coalescing
const firstUser = users[0] ?? defaultUser
```

**Why**: Prevents runtime errors from array/object access

## Resources

- `resources/advanced-generics.md` - Complex generic patterns
- `resources/utility-types.md` - Custom utility types

## Docs

- [TypeScript Performance](https://github.com/microsoft/TypeScript/wiki/Performance)
- [TypeScript 5.9+](https://typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)
