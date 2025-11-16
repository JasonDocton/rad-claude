# React 19.2 Features

## useEffectEvent

Extracts event handlers from Effects - prevents re-runs when non-reactive values change.

```tsx
// ❌ Re-connects on theme change
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId)
    connection.on('connected', () => showNotification('Connected!', theme))
    connection.connect()
    return () => connection.disconnect()
  }, [roomId, theme])
}

// ✅ Only reconnects when roomId changes
import { useEffect, useEffectEvent } from 'react'

function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => showNotification('Connected!', theme))

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId)
    connection.on('connected', () => onConnected())
    connection.connect()
    return () => connection.disconnect()
  }, [roomId]) // theme not in deps
}
```

**Use**: Event handlers inside Effects, accessing latest props without triggering re-run

## Activity Component

Controllable activities with `visible`/`hidden` modes.

```tsx
import { Activity } from 'react'

function SearchPage() {
  const [isSearching, setIsSearching] = useState(false)

  return (
    <div>
      <Activity mode={isSearching ? "visible" : "hidden"}>
        <SearchSpinner />
      </Activity>
      <SearchResults query={query} />
    </div>
  )
}
```

**Use**: Loading spinners, progress indicators, background tasks

## cacheSignal() (RSC Only)

Abort requests when cache invalidates.

```tsx
import { cache } from 'react'
import { cacheSignal } from 'react/unstable_cache'

const getUser = cache(async (userId: string) => {
  const signal = cacheSignal()
  const response = await fetch(`/api/users/${userId}`, { signal })
  return response.json()
})
```

**Use**: Aborting network requests, cleaning server resources (RSC only)

## Performance Tracks

Chrome DevTools shows React-specific tracks (component renders, state updates, effect timing). No code changes - works automatically with React 19.2+.

## Partial Pre-rendering (Experimental)

Pre-render RSC parts for hybrid rendering.

```tsx
import { prerender, resume, resumeAndPrerender } from 'react'

const { prerendered } = await prerender(<App />)
const { html } = await resume(prerendered, dynamicData)
const result = await resumeAndPrerender(<App />, initialData)
```

**Use**: SSG with dynamic islands, ISR. **Status**: Experimental

## Notable Changes

**Batching Suspense**: Multiple Suspense boundaries batch together for smoother loading.

**Web Streams for Node.js**: RSC now supports Web Streams API (previously Node-specific streams).

```tsx
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('data')
      controller.close()
    }
  })
  return new Response(stream)
}
```

**useId Prefix**: Changed `:r1:` → `:R1:` - may affect snapshot tests. Use pattern matching: `/^:R\d+:$/`

## References

- [React 19.2 Release Notes](https://react.dev/blog/2025/10/01/react-19-2)
