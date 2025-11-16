# Convex + Framework Integration

Comprehensive guide for using Convex with Next.js or TanStack Start.

## When to Load This Resource

**Load when**: `convex/` directory exists in project (indicates Convex backend)

**Use with**: Either Next.js or TanStack Start as the frontend framework

## Core Principle

**When `convex/` directory exists, prefer Convex for backend logic over framework-specific server functions.**

Convex is a backend-as-a-service, not just a database. Handle server-side logic in Convex rather than framework-specific server functions whenever possible.

## Why Prefer Convex

**Benefits over framework server functions**:
- **Real-time**: Live queries update automatically via WebSocket (no polling)
- **Transactional**: ACID guarantees for database operations (no race conditions)
- **Type-safe**: Generated TypeScript types end-to-end (schema → functions → client)
- **Auth propagation**: Authentication context flows automatically to queries/mutations
- **Scheduled tasks**: Built-in cron scheduler for async operations
- **No cold starts**: Convex runtime significantly faster than Node.js serverless functions
- **Automatic caching**: Reactive query caching with fine-grained invalidation

## When to Use Convex vs Framework Server Functions

| Use Case | Preferred Approach | Why |
|----------|-------------------|-----|
| **Business logic** (payments, order processing, etc.) | Convex actions/mutations | Transactional guarantees, type-safe, real-time |
| **Database operations** (CRUD) | Convex queries/mutations | ACID guarantees, live updates, automatic caching |
| **Webhooks** (Stripe, GitHub, etc.) | Convex HTTP Actions | Transactional processing, direct database access |
| **Scheduled tasks** (daily reports, cleanup jobs) | Convex cron jobs | Built-in scheduler, reliable execution |
| **Third-party API calls** (with DB updates) | Convex actions | Atomic operations (API call + DB update) |
| **Form submissions** (Next.js only) | Server Actions → proxy to Convex | Need `revalidatePath()` or `redirect()` |
| **SSR data fetching** (Next.js only) | Server Components → proxy to Convex | Need `fetchQuery` for auth context in RSC |
| **Authentication** | Convex auth | Automatic context propagation |

## Next.js + Convex Integration

### Server Components (SSR Data Fetching)

Use `fetchQuery` to call Convex from Server Components with auth context:

```tsx
// app/users/page.tsx (Server Component)
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

export default async function UsersPage() {
  // ✅ SSR with Convex (auth context preserved)
  const users = await fetchQuery(api.users.list)

  return <UserList users={users} />
}
```

### Client Components (Real-Time Updates)

Use `useQuery`/`useMutation` hooks for real-time data:

```tsx
// components/UserList.tsx
'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function UserList() {
  // ✅ Live-updating query via WebSocket
  const users = useQuery(api.users.list)
  const createUser = useMutation(api.users.create)

  if (!users) return <div>Loading...</div>

  return (
    <div>
      {users.map(user => <UserCard key={user._id} user={user} />)}
      <button onClick={() => createUser({ name: 'New User' })}>
        Add User
      </button>
    </div>
  )
}
```

### Server Actions (Form Handling)

Server Actions should proxy to Convex mutations, then handle Next.js-specific routing:

```tsx
// app/users/actions.ts
'use server'

import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string

  // ✅ Call Convex mutation (handles business logic + DB)
  const user = await fetchMutation(api.users.create, { name })

  // ✅ Next.js-specific: Revalidate cache
  revalidatePath('/users')

  // ✅ Next.js-specific: Redirect
  redirect(`/users/${user._id}`)
}
```

**Pattern**: Server Actions handle framework routing (`revalidatePath`, `redirect`), Convex handles business logic and data.

### Provider Setup

```tsx
// app/layout.tsx
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      {children}
    </ConvexAuthNextjsServerProvider>
  )
}
```

### Documentation

- [Convex Next.js Integration](https://docs.convex.dev/client/react/nextjs/)
- [Convex Server Components](https://docs.convex.dev/client/react/nextjs/server-rendering)

## TanStack Start + Convex Integration

### Route Loaders (SSR Data Fetching)

Use Convex queries directly in route loaders:

```tsx
// src/routes/users/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/users')({
  loader: ({ context }) => {
    // ✅ Prefetch Convex query for SSR
    return context.queryClient.ensureQueryData(
      convexQuery(api.users.list, {})
    )
  },
  component: UsersPage
})

function UsersPage() {
  const { data: users } = useSuspenseQuery(
    convexQuery(api.users.list, {})
  )

  return <UserList users={users} />
}
```

### Client Components (Real-Time Updates)

Use `convexQuery` with React Query's `useSuspenseQuery`:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/orders')({
  component: () => {
    // ✅ Live-updating query via WebSocket
    const { data: orders } = useSuspenseQuery(
      convexQuery(api.orders.list, {})
    )

    return <OrderList orders={orders} />
  }
})
```

### Mutations (Form Handling)

Use `useConvexMutation` with React Query:

```tsx
import { useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { useNavigate } from '@tanstack/react-router'

function CreateUserForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createUser = useMutation(
    useConvexMutation(api.users.create)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    createUser.mutate(
      { name: formData.get('name') as string },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] })
          navigate({ to: '/users' })
        }
      }
    )
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**Pattern**: No server actions needed - direct Convex integration via React Query.

### Provider Setup

```tsx
// app/router.tsx
import { ConvexProvider } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)
const convexQueryClient = new ConvexQueryClient(convex)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
})

convexQueryClient.connect(queryClient)

export function Router() {
  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConvexProvider>
  )
}
```

### Documentation

- [Convex TanStack Start Integration](https://docs.convex.dev/client/tanstack/tanstack-start/)
- [Convex React Query](https://docs.convex.dev/client/tanstack/react-query)

## Convex HTTP Actions (Webhooks)

**Always use Convex HTTP Actions for webhooks** (Stripe, GitHub, Clerk, etc.), not framework route handlers.

### Why HTTP Actions for Webhooks

✅ **DO: Convex HTTP Actions**
- Direct database access (no ORM needed)
- Transactional processing (webhook → DB update is atomic)
- Access to all Convex queries/mutations
- Runs on Convex infrastructure (reliable, fast)

❌ **DON'T: Framework route handlers**
- Extra hop (webhook → framework → database)
- More failure points
- Slower (serverless cold starts)
- Harder to debug

### Example: Stripe Webhook

```tsx
// convex/http.ts
import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import Stripe from 'stripe'
import { api } from './_generated/api'

const http = httpRouter()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

http.route({
  path: '/stripe/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get('stripe-signature')!
    const body = await request.text()

    // Verify signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch {
      return new Response('Invalid signature', { status: 401 })
    }

    // Process event transactionally via mutation
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      await ctx.runMutation(api.orders.createFromStripe, {
        sessionId: session.id,
        customerId: session.customer as string,
        amount: session.amount_total!
      })
    }

    return new Response('OK', { status: 200 })
  })
})

export default http
```

### Webhook Setup

**Environment variables**:
```bash
# .env.local
CONVEX_SITE_URL=https://your-deployment.convex.site
# Note: Always .site suffix, NOT .cloud deployment URL
```

**Webhook URL to configure**:
```
https://your-deployment.convex.site/stripe/webhook
```

**Security**: Always verify webhook signatures before processing.

### Documentation

- [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions)
- [Webhook Examples](https://docs.convex.dev/functions/http-actions#webhook-handlers)

## Convex Cron Jobs (Scheduled Tasks)

**Always use Convex cron jobs for scheduled tasks**, not framework-based solutions.

### Example: Daily Report Generation

```tsx
// convex/crons.ts
import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.daily(
  'generate daily report',
  { hourUTC: 9, minuteUTC: 0 }, // 9:00 AM UTC
  internal.reports.generateDaily
)

crons.weekly(
  'cleanup old data',
  { dayOfWeek: 'monday', hourUTC: 2, minuteUTC: 0 },
  internal.maintenance.cleanupOldData
)

export default crons
```

```tsx
// convex/reports.ts
import { internalMutation } from './_generated/server'

export const generateDaily = internalMutation(async (ctx) => {
  // Generate report from database
  const stats = await ctx.db.query('orders')
    .filter(q => q.gt(q.field('createdAt'), Date.now() - 86400000))
    .collect()

  // Store report
  await ctx.db.insert('reports', {
    type: 'daily',
    date: new Date().toISOString(),
    stats: { totalOrders: stats.length }
  })
})
```

### Documentation

- [Convex Cron Jobs](https://docs.convex.dev/scheduling/cron-jobs)

## Common Patterns

### ✅ DO: Convex for Business Logic

```tsx
// convex/orders.ts
import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const createOrder = mutation({
  args: {
    productId: v.id('products'),
    quantity: v.number()
  },
  handler: async (ctx, { productId, quantity }) => {
    // ✅ All business logic in Convex (atomic)
    const product = await ctx.db.get(productId)
    if (!product) throw new Error('Product not found')

    // Check inventory
    if (product.stock < quantity) {
      throw new Error('Insufficient stock')
    }

    // Update stock atomically
    await ctx.db.patch(productId, {
      stock: product.stock - quantity
    })

    // Create order
    const orderId = await ctx.db.insert('orders', {
      productId,
      quantity,
      total: product.price * quantity,
      status: 'pending',
      createdAt: Date.now()
    })

    return orderId
  }
})
```

### ❌ DON'T: Framework Server Functions for Business Logic

```tsx
// ❌ BAD: Business logic in Next.js Server Action
'use server'

export async function createOrder(productId: string, quantity: number) {
  // Problem: No transaction guarantees
  const product = await db.query.products.findFirst({ where: eq(products.id, productId) })

  if (product.stock < quantity) {
    throw new Error('Insufficient stock')
  }

  // Race condition: Stock could change between check and update
  await db.update(products).set({ stock: product.stock - quantity })
  await db.insert(orders).values({ productId, quantity })
}
```

### Pattern: Optimistic Updates

```tsx
// Client component with optimistic update
'use client'

import { useOptimistic } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )

  const createTodo = useMutation(api.todos.create)

  const handleCreate = (text: string) => {
    const tempTodo = { _id: 'temp', text, completed: false }
    addOptimistic(tempTodo)
    createTodo({ text })
  }

  return <div>{/* render optimisticTodos */}</div>
}
```

## Decision Framework

**When you see `convex/` directory**:

1. **Database operations** → Use Convex queries/mutations
2. **Forms with business logic** → Convex mutation (+ Server Action wrapper for Next.js routing)
3. **Webhooks** → Convex HTTP Actions
4. **Scheduled tasks** → Convex cron jobs
5. **Real-time updates** → Convex subscriptions (useQuery)
6. **Authentication** → Convex auth with automatic propagation

**Only use framework server functions for**:
- Next.js routing (`revalidatePath`, `redirect`) after Convex mutation
- Framework-specific features (middleware, image optimization)

## Key Takeaway

If you have Convex, it's your backend. Framework server functions are just thin wrappers for routing and framework-specific features.
