---
name: react-patterns
description: React 19.2 patterns and primitives. Applies to React components, hooks, state, forms. Use for useEffectEvent, useActionState, Activity component, use(), or migrating from older React patterns like React.FC.
---

# React Patterns

React 19+ with TypeScript.

## Rules

| Pattern         | Do                              | Don't                       |
| --------------- | ------------------------------- | --------------------------- |
| Components      | named exports                   | `export default`            |
| Props           | `readonly` always               | mutable interface           |
| Types           | explicit function typing        | `React.FC`                  |
| Defaults        | ES6 parameter defaults          | `defaultProps`              |
| State           | discriminated unions            | bag of optionals            |
| Errors          | Result types (parse/network)    | throw for recoverable       |
| Critical errors | throw                           | Result type                 |
| Effects         | render-driven, `useEffectEvent` | `useEffect` with value deps |

## React 19 Primitives

| Hook/Component     | Purpose                           |
| ------------------ | --------------------------------- |
| `use()`            | extract data from promises        |
| `<Suspense>`       | declarative loading states        |
| `useTransition`    | loading flags, pending async      |
| `useOptimistic`    | instant feedback during mutations |
| `useDeferredValue` | stable UX during rapid updates    |
| `useEffectEvent`   | stable callbacks without re-runs  |
| `useActionState`   | workflow-like async state         |
| `<Activity>`       | preserve UI state when hidden     |

## Performance Micro-Patterns

- Derive state during render, not in useEffect
- Hoist static JSX outside component (avoids re-creation)

## Component Structure

```ts
interface ButtonProps {
  readonly variant: "primary" | "secondary"
  readonly onClick: () => void
  readonly disabled?: boolean
  readonly userId: string | undefined  // critical fields: explicit
  readonly children?: ReactNode
}

export function Button({ variant, onClick, disabled, children }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>
}
```

## State with Discriminated Unions

```ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

const [state, setState] = useState<AsyncState<User>>({ status: "idle" })

switch (state.status) {
  case "idle": return null
  case "loading": return <Spinner />
  case "success": return <UserCard user={state.data} />
  case "error": return <ErrorMessage error={state.error} />
}
```

## useEffectEvent

```ts
// ❌ re-runs on theme change
useEffect(() => {
  connection.on("connected", () => showNotification("Connected!", theme));
}, [roomId, theme]);

// ✅ only re-runs on roomId
const onConnected = useEffectEvent(() => showNotification("Connected!", theme));
useEffect(() => {
  connection.on("connected", () => onConnected());
}, [roomId]);
```

## Forms (Actions)

```ts
// ✅ useActionState over onSubmit
const [state, formAction, isPending] = useActionState(updateUser, initialState);
```

Use `useFormStatus` for pending states in child components.

## Result Types

```ts
type Result<T, E extends Error> = { ok: true; value: T } | { ok: false; error: E }

const result = parseJson(input)
if (!result.ok) return <Error message={result.error.message} />
```

Use Result for: parsing, file ops, network. Throw for: validation, critical failures.

## Activity Component

```ts
<Activity mode={isSearching ? "visible" : "hidden"}>
  <SearchSpinner />
</Activity>
```

Preserves state when hidden — use for tabs, search overlays, conditional UI.

## Anti-Patterns

```ts
// ❌ React.FC
const Button: React.FC<Props> = () => {};

// ❌ defaultProps
Button.defaultProps = { variant: "primary" };

// ❌ default exports
export default function MyComponent() {}

// ❌ mutable props
interface Props {
  count: number;
}
```
