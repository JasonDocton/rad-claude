# Next.js 16 Patterns

Comprehensive patterns for Next.js 16 App Router with React Server Components.

## Server vs Client Component Decision Guide

**Default: Use Server Components** (no directive needed)

**Use Server Components for**:
- Data fetching from databases/APIs
- Accessing backend resources (filesystem, environment variables, secrets)
- Keeping sensitive code/logic on server
- Static rendering for SEO
- Large dependencies that don't need client-side execution

**Use Client Components (`'use client'`) for**:
- Interactivity (onClick, onChange, onSubmit, etc.)
- React hooks (useState, useEffect, useContext, etc.)
- Browser APIs (window, localStorage, geolocation, etc.)
- Event listeners (scroll, resize, mouse events)
- Third-party libraries that require client-side execution

**Rule of thumb**: Start with Server Component. Add `'use client'` only when you need interactivity or browser APIs.

## Server Components by Default

```tsx
// app/users/page.tsx (Server Component - default)
import { db } from "@/lib/db"
import type { User } from "@/types/user"

export default async function UsersPage() {
  // ✅ Direct data fetching in Server Component
  const users = await db.query.users.findMany()

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  )
}
```

**Why Server Components?**
- Fetch data directly (no API route needed)
- Access backend resources (database, filesystem)
- Keep sensitive code on server
- Reduce client bundle size
- Better SEO (fully rendered HTML)

## Client Components When Needed

```tsx
// components/UserList.tsx
'use client'

import { useState } from 'react'

interface UserListProps {
  readonly users: readonly User[]
}

export function UserList({ users }: UserListProps) {
  const [filter, setFilter] = useState('')

  // ✅ Client-side interactivity
  const filtered = users.filter(u => u.name.includes(filter))

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      {filtered.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

**When to use `'use client'`:**
- Interactivity (onClick, onChange, onSubmit)
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, etc.)
- Event listeners
- Context providers that use state

## Server Actions for Mutations

```tsx
// app/users/actions.ts
'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  // Validate
  if (!name || !email) {
    return { error: 'Name and email required' }
  }

  // Insert
  const user = await db.insert(users).values({ name, email })

  // Revalidate cache
  revalidatePath('/users')

  // Redirect to new user
  redirect(`/users/${user.id}`)
}
```

**Using Server Actions:**

```tsx
// app/users/new/page.tsx (Server Component)
import { createUser } from '../actions'

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

**Server Action Benefits:**
- Progressive enhancement (works without JS)
- Type-safe server mutations
- Automatic revalidation
- No API route boilerplate

## Route Handlers (API Routes)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get('page') || '1')

  const users = await db.query.users.findMany({
    limit: 20,
    offset: (page - 1) * 20
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate
  const result = userSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  // Insert
  const user = await db.insert(users).values(result.data)

  return NextResponse.json(user, { status: 201 })
}
```

**Dynamic route handlers:**

```tsx
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, params.id)
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(user)
}
```

**When to use Route Handlers:**
- External API consumption (webhooks)
- Non-HTML responses (JSON, XML)
- Third-party integrations
- Mobile app endpoints

**Note**: For form mutations, prefer Server Actions over Route Handlers.

## Layouts for Shared UI

```tsx
// app/dashboard/layout.tsx (Server Component)
export default function DashboardLayout({
  children
}: {
  readonly children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <nav>
        <a href="/dashboard">Home</a>
        <a href="/dashboard/users">Users</a>
      </nav>
      <main>{children}</main>
    </div>
  )
}
```

**Nested Layouts:**

```tsx
// app/dashboard/users/layout.tsx
export default function UsersLayout({
  children
}: {
  readonly children: React.ReactNode
}) {
  return (
    <div className="users-layout">
      <aside>
        <a href="/dashboard/users">All Users</a>
        <a href="/dashboard/users/new">New User</a>
      </aside>
      <div>{children}</div>
    </div>
  )
}
```

**Layout Benefits:**
- Shared UI across routes
- Persistent state
- No re-render on navigation
- Nested layouts compose

## Loading States

```tsx
// app/users/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  )
}
```

**Streaming with Suspense:**

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Fast component renders immediately */}
      <QuickStats />

      {/* Slow component shows loading.tsx */}
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowDataTable />
      </Suspense>
    </div>
  )
}

async function SlowDataTable() {
  const data = await fetchSlowData()
  return <DataTable data={data} />
}
```

## Error Boundaries

```tsx
// app/users/error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  readonly error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Global error boundary:**

```tsx
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Application Error</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```

## Metadata & SEO

```tsx
// app/users/[id]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, params.id)
  })

  return {
    title: user?.name || 'User',
    description: `Profile for ${user?.name}`,
    openGraph: {
      title: user?.name,
      description: user?.bio,
      images: [user?.avatarUrl]
    }
  }
}

export default async function UserPage({
  params
}: {
  params: { id: string }
}) {
  const user = await fetchUser(params.id)
  return <UserProfile user={user} />
}
```

## Caching & Revalidation

```tsx
// Force dynamic rendering (no cache)
export const dynamic = 'force-dynamic'

// Revalidate every 60 seconds
export const revalidate = 60

// app/products/page.tsx
export default async function ProductsPage() {
  const products = await db.query.products.findMany()
  return <ProductList products={products} />
}
```

**Manual revalidation:**

```tsx
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateProduct(id: string, data: ProductData) {
  await db.update(products).set(data).where(eq(products.id, id))

  // Revalidate specific path
  revalidatePath('/products')
  revalidatePath(`/products/${id}`)

  // Or revalidate by cache tag
  revalidateTag('products')
}
```

## Parallel Routes & Intercepting Routes

**Parallel Routes:**

```tsx
// app/dashboard/@analytics/page.tsx
// app/dashboard/@notifications/page.tsx
// app/dashboard/layout.tsx

export default function DashboardLayout({
  children,
  analytics,
  notifications
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <div>
      <div>{children}</div>
      <aside>
        {analytics}
        {notifications}
      </aside>
    </div>
  )
}
```

**Intercepting Routes (Modals):**

```tsx
// app/photos/[id]/page.tsx (Full page)
export default async function PhotoPage({ params }: { params: { id: string } }) {
  const photo = await fetchPhoto(params.id)
  return <FullPhotoView photo={photo} />
}

// app/@modal/(.)photos/[id]/page.tsx (Modal intercept)
export default async function PhotoModal({ params }: { params: { id: string } }) {
  const photo = await fetchPhoto(params.id)
  return <PhotoModalView photo={photo} />
}
```

## Route Groups

```tsx
// (auth) group - shared layout, not in URL
// app/(auth)/login/page.tsx     → /login
// app/(auth)/register/page.tsx  → /register
// app/(auth)/layout.tsx         → Shared auth layout

// (dashboard) group
// app/(dashboard)/users/page.tsx    → /users
// app/(dashboard)/settings/page.tsx → /settings
// app/(dashboard)/layout.tsx        → Shared dashboard layout
```

## Middleware

```tsx
// middleware.ts (root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('auth-token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

## Documentation

- [Next.js 16 Announcement](https://nextjs.org/blog/next-16)
- [App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
