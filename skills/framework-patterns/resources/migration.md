# Framework Migration Guide

Guide for migrating between modern React frameworks.

## Next.js → TanStack Start

### Routing Patterns

**Next.js App Router:**
```tsx
// app/users/[id]/page.tsx
export default async function UserPage({
  params
}: {
  params: { id: string }
}) {
  const user = await fetchUser(params.id)
  return <UserProfile user={user} />
}
```

**TanStack Start equivalent:**
```tsx
// src/routes/users/$userId.tsx
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId)
    return { user }
  },
  component: UserPage
})

function UserPage() {
  const { user } = Route.useLoaderData()
  return <UserProfile user={user} />
}
```

### Layouts

**Next.js:**
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children
}: {
  readonly children: React.ReactNode
}) {
  return (
    <div>
      <nav>...</nav>
      <main>{children}</main>
    </div>
  )
}
```

**TanStack Start:**
```tsx
// src/routes/_dashboard.tsx
export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout
})

function DashboardLayout() {
  return (
    <div>
      <nav>...</nav>
      <main><Outlet /></main>
    </div>
  )
}

// src/routes/_dashboard/users.tsx (child)
export const Route = createFileRoute('/_dashboard/users')({
  component: UsersPage
})
```

### Loading States

**Next.js:**
```tsx
// app/users/loading.tsx
export default function Loading() {
  return <Spinner />
}
```

**TanStack Start:**
```tsx
export const Route = createFileRoute('/users')({
  loader: async () => { /* ... */ },
  pendingComponent: () => <Spinner />,
  component: UsersPage
})
```

### Error Handling

**Next.js:**
```tsx
// app/users/error.tsx
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Error: {error.message}</h2>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
```

**TanStack Start:**
```tsx
export const Route = createFileRoute('/users')({
  loader: async () => { /* ... */ },
  errorComponent: ({ error, reset }) => (
    <div>
      <h2>Error: {error.message}</h2>
      <button onClick={reset}>Retry</button>
    </div>
  ),
  component: UsersPage
})
```

### Server Actions → Client Mutations

**Next.js Server Actions:**
```tsx
// app/actions.ts
'use server'
export async function createUser(formData: FormData) {
  const user = await db.insert(users).values({
    name: formData.get('name') as string
  })
  revalidatePath('/users')
  return user
}

// app/users/new/page.tsx
import { createUser } from '../actions'

export default function NewUserPage() {
  return <form action={createUser}>...</form>
}
```

**TanStack Start equivalent:**
```tsx
import { useMutation } from '@tanstack/react-query'

function NewUserPage() {
  const navigate = useNavigate()

  const createUserMutation = useMutation({
    mutationFn: async (data: UserData) => {
      return await db.insert(users).values(data)
    },
    onSuccess: () => {
      navigate({ to: '/users' })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createUserMutation.mutate({
      name: formData.get('name') as string
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Metadata

**Next.js:**
```tsx
export const metadata: Metadata = {
  title: 'Users',
  description: 'User management'
}
```

**TanStack Start:**
```tsx
export const Route = createFileRoute('/users')({
  meta: () => [
    { title: 'Users' },
    { name: 'description', content: 'User management' }
  ],
  component: UsersPage
})
```

## TanStack Start → Next.js

### File-Based Routes → App Router

**TanStack Start:**
```
src/routes/
├── index.tsx              → /
├── users/
│   ├── index.tsx          → /users
│   └── $userId.tsx        → /users/:userId
```

**Next.js App Router:**
```
app/
├── page.tsx               → /
├── users/
│   ├── page.tsx           → /users
│   └── [id]/
│       └── page.tsx       → /users/:id
```

### Route Loaders → Server Components

**TanStack Start:**
```tsx
export const Route = createFileRoute('/users')({
  loader: async () => {
    const users = await fetchUsers()
    return { users }
  },
  component: () => {
    const { users } = Route.useLoaderData()
    return <UserList users={users} />
  }
})
```

**Next.js:**
```tsx
// app/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers()
  return <UserList users={users} />
}
```

### TanStack Query → Server Components/Actions

**TanStack Start (client-side):**
```tsx
import { useQuery, useMutation } from '@tanstack/react-query'

function UsersPage() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return <UserList users={users} onCreate={createMutation.mutate} />
}
```

**Next.js (server-side):**
```tsx
// app/users/page.tsx (Server Component)
export default async function UsersPage() {
  const users = await db.query.users.findMany()
  return <UserList users={users} onCreate={createUser} />
}

// app/users/actions.ts
'use server'
export async function createUser(formData: FormData) {
  await db.insert(users).values({
    name: formData.get('name') as string
  })
  revalidatePath('/users')
}
```

### Navigation

**TanStack Start:**
```tsx
import { Link, useNavigate } from '@tanstack/react-router'

function UserList() {
  const navigate = useNavigate()

  return (
    <div>
      <Link to="/users/$userId" params={{ userId: '123' }}>
        User
      </Link>
      <button onClick={() => navigate({ to: '/users' })}>
        Go to Users
      </button>
    </div>
  )
}
```

**Next.js:**
```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function UserList() {
  const router = useRouter()

  return (
    <div>
      <Link href="/users/123">User</Link>
      <button onClick={() => router.push('/users')}>
        Go to Users
      </button>
    </div>
  )
}
```

## Common Migration Considerations

### State Management

Both frameworks work with:
- **Zustand** - Client state
- **Jotai** - Atomic state
- **Context API** - React built-in

### Styling

Both support:
- **Tailwind CSS** - Utility-first
- **CSS Modules** - Scoped styles
- **styled-components** - CSS-in-JS

### Authentication

**Next.js patterns:**
- Server Components check auth
- Middleware for route protection
- Server Actions with auth

**TanStack Start patterns:**
- Route context for auth state
- `beforeLoad` for route protection
- Client mutations with auth tokens

### Database

Both work with:
- **Convex** - Real-time backend (recommended)
- **Drizzle ORM** - Type-safe SQL
- **Prisma** - ORM

**Preference**: Use Convex when available (see framework-patterns/SKILL.md for integration)

## Performance Comparison

| Feature | Next.js 16 | TanStack Start |
|---------|-----------|----------------|
| SSR | ✅ Built-in | ✅ Available |
| Code splitting | ✅ Automatic | ✅ Automatic |
| Route preloading | ✅ Prefetch | ✅ Intent/viewport |
| Streaming | ✅ Suspense | ✅ Suspense |
| Type safety | ⚠️ Params as strings | ✅ Full type safety |
| Real-time | ⚠️ Via libraries | ✅ Via Convex/React Query |

## Decision Matrix

**Choose Next.js if:**
- Need static site generation (SSG)
- Want built-in image optimization
- Prefer server-first architecture
- Need middleware for edge functions
- Team familiar with Next.js

**Choose TanStack Start if:**
- Want full type-safe routing
- Prefer client-first with SSR
- Using Convex (excellent integration)
- Need flexible data fetching patterns
- Want React Query integration

## Hybrid Approach: Next.js + Convex

If using Next.js with Convex backend:

```tsx
// app/users/page.tsx (Server Component)
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

export default async function UsersPage() {
  const users = await fetchQuery(api.users.list)
  return <UserList users={users} />
}

// components/UserList.tsx (Client Component)
'use client'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function UserList({ users }: { users: User[] }) {
  const createUser = useMutation(api.users.create)

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

**Reference**: [Convex Next.js Integration](https://docs.convex.dev/client/react/nextjs/)
