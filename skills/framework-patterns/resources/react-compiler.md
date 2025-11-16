# React Compiler (Next.js 16)

Automatic memoization for React components - eliminates manual `useMemo`/`useCallback` in most cases.

## Detection

Check `next.config.ts` or `next.config.js` for:

```ts
const nextConfig = {
  reactCompiler: true,
}
```

If present, apply patterns below.

## What It Does

- **Auto-memoizes components/hooks** - prevents cascading re-renders
- **Caches expensive calculations** - automatic optimization
- **Stabilizes function references** - prevents unnecessary prop changes

**Limitations**:
- Only memoizes React components and hooks (not standalone functions)
- Memoization not shared across components (each optimized independently)

## Key Rules

### ✅ DO: Rely on Compiler for New Code

```tsx
// ✅ No manual memoization needed
export function ExpensiveList({ items, filter }: Props) {
  const filtered = items.filter(item => item.name.includes(filter))
  const sorted = filtered.sort((a, b) => a.price - b.price)

  return (
    <div>
      {sorted.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  )
}
// Compiler automatically memoizes filtered/sorted computations
```

### ✅ DO: Keep Existing Memoization (Migration)

```tsx
// ✅ Leave in place during migration
export function UserProfile({ userId }: Props) {
  const user = useMemo(() => fetchUser(userId), [userId])
  const handleClick = useCallback(() => updateUser(userId), [userId])

  return <div onClick={handleClick}>{user.name}</div>
}
// Removing manual memoization can change compilation output - test first
```

### ✅ DO: Use useMemo/useCallback as Escape Hatches

```tsx
// ✅ Manual control for effect dependencies
export function LiveData({ endpoint }: Props) {
  // Compiler might not stabilize this reference
  const fetchData = useCallback(async () => {
    return fetch(endpoint).then(r => r.json())
  }, [endpoint])

  useEffect(() => {
    fetchData() // Stable reference prevents unnecessary re-runs
  }, [fetchData])

  return <div>...</div>
}
```

**Use manual memoization when**:
- Memoized value is effect dependency (stable reference needed)
- Precise control required for specific optimization
- Compiler doesn't optimize correctly (rare edge case)

### ⚠️ AVOID: Breaking Rules of React

Compiler requires strict adherence to Rules of React. Violations prevent optimization.

```tsx
// ❌ Conditional hook calls
function Component({ show }: Props) {
  if (show) {
    const [count, setCount] = useState(0) // Compiler cannot optimize
  }
}

// ❌ setState in render
function Component() {
  const [count, setCount] = useState(0)
  setCount(count + 1) // Infinite loop - ESLint catches this
  return <div>{count}</div>
}

// ❌ Unsafe ref access during render
function Component() {
  const ref = useRef(0)
  ref.current += 1 // Side effect during render - compiler skips
  return <div>{ref.current}</div>
}
```

## Biome Integration

**Note**: We use Biome for linting/formatting (not ESLint). Biome is aware of React Compiler rules:

- `set-state-in-render` - Catches infinite render loops
- `set-state-in-effect` - Flags expensive/improperly timed effect work
- `refs` - Prevents unsafe ref handling during render

Biome will catch Rules of React violations that prevent compiler optimization.

## Performance Expectations

**Meta Quest Store results**:
- Initial loads: up to 12% faster
- Cross-page navigations: up to 12% faster
- Certain interactions: >2.5× faster
- Memory: neutral impact

**Note**: Well-optimized apps with manual memoization may see minimal improvement. Value is automatic correctness without maintenance burden.

## DevTools Support

React DevTools shows compiler decisions:
- Memoization badge on optimized components
- Warnings if component de-opted (with hints)

## Migration Strategy

**For existing codebases**:

1. **Fix Rules of React violations** - Biome will catch these
2. **Test current codebase** - ensure no violations
3. **Enable compiler incrementally** - use gating strategies (see official guide)
4. **Keep manual memoization** - remove only after thorough testing
5. **Pin exact version** (`1.0.0`) if lacking test coverage

**For new projects**:
- Enable React Compiler from start
- Rely on automatic optimization
- Use `useMemo`/`useCallback` only when needed (escape hatches)

## Gotchas

**Changing memoization can affect effects**:

```tsx
// Compiler memoizes props, effect may not re-run as expected
useEffect(() => {
  logAnalytics(user)
}, [user]) // Compiler might stabilize user reference

// ✅ Better: explicit dependency on critical field
useEffect(() => {
  logAnalytics(user)
}, [user.id]) // Compiler optimizes, but id changes trigger effect
```

**Future compiler updates may change memoization strategy** - maintain end-to-end tests for confidence.

## References

- [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction)
- [Next.js 16 React Compiler Support](https://nextjs.org/blog/next-16#react-compiler-support-stable)
