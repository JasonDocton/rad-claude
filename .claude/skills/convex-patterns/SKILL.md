---
name: convex-patterns
description: Convex backend patterns and type safety. Applies to schema design, validators, mutations, queries, actions, auth checks, indexes, HTTP webhooks, rate limiting, type derivation. Also applies to scheduled tasks, cron jobs, realtime subscriptions, live queries, server action integration, business logic placement, and webhook handlers.
---

# Convex Patterns

Schema is single source of truth. All types derive from it.

## Quick Reference

- Files: `snake_case.ts` (kebab-case fails deploy)
- Fields: `snake_case`
- Types: derive from schema, never duplicate
- Validators: derive with `.fields.fieldName`, never manual
- Partials: `satisfies Partial<SchemaType>`, never `Pick<>` or manual interface
- Auth: check every function
- Queries: `.withIndex()` not `.filter()`

## Type Derivation

`Doc<"table">` - includes `_id`, `_creationTime` - use when reading from DB
`Infer<typeof validator>` - excludes system fields - use for mutation args
`WithoutSystemFields<Doc<"table">>` - use when spreading docs for insert

## Schema Exports

```
// schema.ts - define tables and validators
export const sessionsValidator = schema.tables.sessions.validator
export default schema

// types.ts - derive ALL types from schema
export const platformProviderValidator = platformTokensValidator.fields.provider
export type PlatformProvider = Infer<typeof platformProviderValidator>
export type FraudFlagType = Infer<typeof fraudFlagsValidator.fields.type>
```

## Schema-Driven Mutations

Args from schema:
`args: tableValidator.fields`

Reusable field validators:
`export const providerValidator = tableValidator.fields.provider`

Upsert pattern:

```
if (existing) {
  const { user_id: _, provider: __, ...updateFields } = args
  await ctx.db.patch(existing._id, updateFields)
  return existing._id
}
return await ctx.db.insert("table", args)
```

Explicit returns:
`returns: v.id("table"), handler: async (ctx, args): Promise<Id<"table">> => { ... }`

## Schema-Validated Returns

```
// ✅ validates fields exist in schema, infers return type
return { type, severity, description } satisfies Partial<FraudFlag>

// ❌ manual types duplicate schema
type FlagData = Pick<FraudFlag, "type" | "severity">
interface FlagData { type: FraudFlagType; severity: FraudFlagSeverity }
```

Usage at call site - spread validated partial into full record:

```
const flagData = buildFlagData(result)
if (flagData) await ctx.db.insert("fraudFlags", { ...flagData, user_id, status: "pending" })
```

## File Locations

`schema.ts`: tables, exported validators. Never business logic.
`types.ts`: derived types via `Infer<>`. Never manual definitions.
`*.ts`: import from types, use `Doc<>`. Never local types mirroring schema.

Convex type inference can handle subfolders importing from root. !!It can't handle subfolders importing from other subfolders when custom builders are involved!!

## Security

All functions PUBLIC by default. Every mutation/query must:

1. Validate args with `v.object({...})`
2. Check auth: `const userId = await getAuthUserId(ctx); if (!userId) throw new Error('Unauthorized')`
3. Verify ownership before operations
4. Validate beyond schema (ranges, business rules)

## Error Handling

Review if src/utils/errors.ts or src/utils/logger.ts should be used!
Expected failures: `throw new ConvexError({ code: "ERROR_CODE", message: "User-safe message" })`
Observability: `logger.error("Context for debugging", { status, provider })`
Never in ConvexError.data: tokens, IDs, PII

## Auth Pattern

```
export const updateOrder = mutation({
  args: { order_id: v.id("orders"), status: statusValidator },
  handler: async (ctx, { order_id, status }) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')
    const order = await ctx.db.get(order_id)
    if (!order) throw new Error('Not found')
    if (order.user_id !== userId) throw new Error('Access denied')
    await ctx.db.patch(order_id, { status })
  }
})
```

## Validator Reuse

```
// ✅ From schema
args: sessionFieldsExport
args: { id: v.id("sessions"), ...schema.tables.sessions.validator.fields }

// ❌ Copy-paste
args: { name: v.string(), status: v.union(...) }
```

## Index Usage

```
// ✅ O(log n)
await ctx.db.query('users').withIndex('by_email', q => q.eq('email', email)).first()

// ❌ O(n) scan
await ctx.db.query('users').filter(q => q.eq(q.field('email'), email)).first()
```

## Helper Composition

Atomic → Composite → Relationship → Query. Each layer composes the one below.

```
// Atomic
async function getPlatformToken(db, userId, provider) {
  return await db.query("platformTokens").withIndex("by_user_provider", q => q.eq("user_id", userId).eq("provider", provider)).first()
}

// Composite
async function getAllPlatformTokens(db, userId) {
  const [twitch, kick] = await Promise.all([getPlatformToken(db, userId, "twitch"), getPlatformToken(db, userId, "kick")])
  return { twitch, kick }
}

// Query - business logic only
export const getEntryDetails = query({
  args: { entry_id: v.id("entries") },
  handler: async (ctx, { entry_id }) => {
    const details = await getEntryWithDetails(ctx, entry_id)
    if (!details) return null
    return { ...details, trustScore: computeTrustScore(details) }
  },
})
```

Generic constraints: `<T extends keyof DataModel>` not `extends string`. Return `null` for optional, throw for required. Use `readonly` on return types. Only create for patterns used 2+ times.

## Idempotency

Check-before-insert:

```
const existing = await ctx.db.query('entries').withIndex('by_user_session', q => q.eq('user_id', userId).eq('session_id', sessionId)).first()
if (existing) return existing._id
return await ctx.db.insert('entries', { user_id: userId, session_id: sessionId })
```

Idempotency keys: query by key before processing, store with key after.
Webhook dedup: index on `event_id`, check before processing, always return 200.

## HTTP Actions

Use `CONVEX_SITE_URL` for webhooks (not `CONVEX_URL`).

```
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature")
    const body = await request.text()
    if (!verifyStripeSignature(body, signature, WEBHOOK_SECRET)) return new Response("Invalid signature", { status: 401 })
    const event = JSON.parse(body)
    await ctx.runMutation(api.webhooks.process, { event_id: event.id, event_type: event.type, data: event.data.object })
    return new Response("OK", { status: 200 })
  })
})
```

## Rate Limiting

```
const limiter = new RateLimiter(components.rateLimiter, { createOrder: { kind: 'token bucket', rate: 10, period: 60_000 } })
await limiter.limit(ctx, 'createOrder', { key: userId })
```

Common: Registration 3/IP/24h, Login 10/email/5min, Entries 1/user/session.

## Anti-Patterns

Type duplication: `interface UserData { email?: string }` → `import type { User } from "./types"`
Manual mapping: `return { _id: entry._id, ... }` → `return { ...entry, email: redact(entry.email) }`
Loose enums: `status: v.string()` → `status: v.union(v.literal("draft"), v.literal("active"))`
Manual validators: `v.union(v.literal("twitch"), v.literal("kick"))` → `tableValidator.fields.provider`
Manual partials: `Pick<FraudFlag, "type">` or `interface FlagData {}` → `satisfies Partial<FraudFlag>`

## Troubleshooting Protocol

If "circular dependency" occurs, verify no subfolder is importing from another subfolder.

## Critical Facts

- `_creationTime` auto-appended to all indexes — don't add custom `createdAt`
- Index fields must match query order, most selective first (multi-tenant: `user_id` first)
- `undefined` = missing field, `null` = explicit empty — use `v.optional()` vs `v.union(type, v.null())`
- No DB-level unique constraints — that's why check-before-insert pattern exists
- `.collect()` bandwidth includes filtered-out docs — filter at index level
- 1MB document limit — watch unbounded arrays
- Don't load data to count it — paginate with `{ numItems: 50 }`, show "50+" if `!page.isDone`
