---
name: tailwind-patterns
description: Tailwind 4.0 patterns for styling React components. Applies to class usage, color selection, inheritance optimization, responsive design, or reducing redundant utilities and wrapper divs.
---

# Tailwind Patterns

Tailwind 4.0 — no config file. Check `src/global.css` for theme.

## Rules

| Pattern     | Do                   | Don't                    |
| ----------- | -------------------- | ------------------------ |
| Inheritance | set at highest level | repeat inherited styles  |
| Elements    | merge classes        | wrapper divs for styling |
| Colors      | custom palette only  | default Tailwind colors  |
| Utilities   | only when changing   | redundant classes        |

**Custom colors:** `primary`, `secondary`, `tertiary`, `quaternary`, `accent`, `background`

## Before Adding a Class

1. Already inherited? → check parents
2. Can apply to parent? → reduce duplication
3. Wrapper necessary? → merge into one element
4. Color in config? → only use custom palette

## Inheritance

```tsx
// ✅ set once at root
<body className="text-secondary bg-background font-sans">
  <Header />
  <Main />
</body>

// ❌ redundant — already inherited
<header className="text-secondary font-sans">
  <h1 className="text-secondary">Title</h1>
</header>
```

## Override Only When Changing

```tsx
// ✅ only utilities that CHANGE from parent
<div className="bg-primary text-background p-4">
  <h2 className="text-xl font-bold">Title</h2>
  <p>Body inherits text-background</p>
</div>

// ❌ re-applying inherited
<h2 className="text-background text-xl">Title</h2>
```

## Merge Classes, Not Wrappers

```tsx
// ✅ single element
<button className="bg-primary text-background px-4 py-2 rounded">
  {children}
</button>

// ❌ wrapper div for styling
<div className="bg-primary rounded">
  <button className="text-background px-4 py-2">{children}</button>
</div>
```

## Custom Colors Only

```tsx
// ✅ custom config
<div className="bg-primary text-background">
  <span className="text-accent">Accent</span>
</div>

// ❌ default Tailwind palette
<div className="bg-blue-500 text-white">
  <p className="text-gray-600">Text</p>
</div>
```

To verify config: `mgrep .css` → look for `@import "tailwindcss";`

## Responsive

```tsx
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
</div>
```

## Conditional Styling

```tsx
<button
  className={variant === "primary"
    ? "bg-primary text-background"
    : "bg-secondary text-primary"}
>
  Click me
</button>
```
