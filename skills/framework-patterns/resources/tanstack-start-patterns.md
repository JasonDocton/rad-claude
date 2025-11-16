# TanStack Start v1 Patterns

Comprehensive patterns for TanStack Start with type-safe routing and React Router integration.

## File-Based Routing

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to TanStack Start</p>
    </div>
  )
}
```

**Route Structure:**

```
src/routes/
├── index.tsx              → /
├── about.tsx              → /about
├── users/
│   ├── index.tsx          → /users
│   └── $userId.tsx        → /users/:userId
└── posts/
    ├── index.tsx          → /posts
    ├── new.tsx            → /posts/new
    └── $postId/
        ├── index.tsx      → /posts/:postId
        └── edit.tsx       → /posts/:postId/edit
```

## Route Loaders (Data Fetching)

```tsx
// src/routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchUser } from '@/lib/api'

export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId)
    return { user }
  },
  component: UserPage
})

function UserPage() {
  const { user } = Route.useLoaderData()

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

**Loader with dependencies:**

```tsx
export const Route = createFileRoute('/users')({
  validateSearch: z.object({
    page: z.number().default(1),
    filter: z.string().optional()
  }),
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter
  }),
  loader: async ({ deps }) => {
    const users = await fetchUsers({
      page: deps.page,
      filter: deps.filter
    })
    return { users }
  },
  component: UsersPage
})
```

## Type-Safe Navigation

```tsx
import { Link } from '@tanstack/react-router'

export function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {/* ✅ Type-safe params - TypeScript validates userId exists */}
          <Link to="/users/$userId" params={{ userId: user.id }}>
            {user.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

**Navigation with search params:**

```tsx
import { useNavigate } from '@tanstack/react-router'

function UsersPage() {
  const navigate = useNavigate({ from: '/users' })
  const search = Route.useSearch()

  const nextPage = () => {
    navigate({
      search: { ...search, page: search.page + 1 }
    })
  }

  return (
    <div>
      <button onClick={nextPage}>Next Page</button>
    </div>
  )
}
```

## Search Params Validation

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  page: z.number().int().positive().default(1),
  filter: z.string().optional(),
  sort: z.enum(['name', 'email', 'createdAt']).default('name')
})

export const Route = createFileRoute('/users')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter,
    sort: search.sort
  }),
  loader: async ({ deps }) => {
    const users = await fetchUsers(deps)
    return { users }
  },
  component: UsersPage
})

function UsersPage() {
  const { users } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const changeSort = (sort: 'name' | 'email' | 'createdAt') => {
    navigate({
      search: { ...search, sort }
    })
  }

  return (
    <div>
      <select value={search.sort} onChange={e => changeSort(e.target.value)}>
        <option value="name">Name</option>
        <option value="email">Email</option>
        <option value="createdAt">Created</option>
      </select>
      <UserList users={users} />
    </div>
  )
}
```

## Layouts (Route Groups)

```tsx
// src/routes/_layout.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: LayoutComponent
})

function LayoutComponent() {
  return (
    <div className="layout">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

// src/routes/_layout/about.tsx (child route)
export const Route = createFileRoute('/_layout/about')({
  component: AboutPage
})
```

**Authenticated Layout:**

```tsx
// src/routes/_auth.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthLayout
})

function AuthLayout() {
  return (
    <div>
      <header>Dashboard Header</header>
      <Outlet />
    </div>
  )
}

// src/routes/_auth/dashboard.tsx
export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage
})
```

## Error Handling

```tsx
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId)
    if (!user) {
      throw new Error('User not found')
    }
    return { user }
  },
  errorComponent: ({ error }) => (
    <div>
      <h2>Error Loading User</h2>
      <p>{error.message}</p>
    </div>
  ),
  component: UserPage
})
```

## Pending States

```tsx
export const Route = createFileRoute('/users')({
  loader: async () => {
    const users = await fetchUsers()
    return { users }
  },
  pendingComponent: () => (
    <div className="animate-pulse">
      Loading users...
    </div>
  ),
  component: UsersPage
})
```

**Using pending state in component:**

```tsx
import { useRouter } from '@tanstack/react-router'

function UsersPage() {
  const router = useRouter()
  const isLoading = router.state.isLoading

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      <UserList users={users} />
    </div>
  )
}
```

## Route Context

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext } from '@tanstack/react-router'

interface RouterContext {
  auth: {
    isAuthenticated: boolean
    user?: User
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent
})

// Using context in routes
export const Route = createFileRoute('/profile')({
  loader: async ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/login' })
    }
    return { user: context.auth.user }
  },
  component: ProfilePage
})
```

## Route Preloading

```tsx
import { Link } from '@tanstack/react-router'

export function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {/* ✅ Preload on hover */}
          <Link
            to="/users/$userId"
            params={{ userId: user.id }}
            preload="intent"
          >
            {user.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

**Preload options:**
- `preload="intent"` - Preload on hover/focus
- `preload="viewport"` - Preload when visible
- `preload={false}` - No preloading

## Form Actions

```tsx
// src/routes/users/new.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/users/new')({
  component: NewUserPage
})

function NewUserPage() {
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const user = await createUser({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    })

    navigate({ to: '/users/$userId', params: { userId: user.id } })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

## Data Mutations with TanStack Query

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

function NewUserPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (user) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Navigate to new user
      navigate({ to: '/users/$userId', params: { userId: user.id } })
    }
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    createUserMutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button
        type="submit"
        disabled={createUserMutation.isPending}
      >
        {createUserMutation.isPending ? 'Creating...' : 'Create'}
      </button>
      {createUserMutation.isError && (
        <p>Error: {createUserMutation.error.message}</p>
      )}
    </form>
  )
}
```

## TanStack Start + Convex Integration

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/orders')({
  component: OrdersPage
})

function OrdersPage() {
  // ✅ Live-updating Convex query via WebSocket
  const { data: orders } = useSuspenseQuery(
    convexQuery(api.orders.list, {})
  )

  return <OrderList orders={orders} />
}
```

**Convex mutations:**

```tsx
import { useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'

function CreateOrderForm() {
  const createOrder = useMutation(
    useConvexMutation(api.orders.create)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createOrder.mutate({
      productId: selectedProduct,
      quantity: 1
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**Reference**: [Convex TanStack Start Docs](https://docs.convex.dev/client/tanstack/tanstack-start/)

## Meta Tags & SEO

```tsx
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId)
    return { user }
  },
  meta: ({ loaderData }) => [
    { title: loaderData.user.name },
    { name: 'description', content: `Profile for ${loaderData.user.name}` },
    { property: 'og:title', content: loaderData.user.name },
    { property: 'og:image', content: loaderData.user.avatarUrl }
  ],
  component: UserPage
})
```

## Not Found Routes

```tsx
// src/routes/$404.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$404')({
  component: NotFoundPage
})

function NotFoundPage() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  )
}
```

## Documentation

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [v1 Release Notes](https://tanstack.com/blog/tanstack-start-v1)
- [File-Based Routing Guide](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)
- [Convex Integration](https://docs.convex.dev/client/tanstack/tanstack-start/)
