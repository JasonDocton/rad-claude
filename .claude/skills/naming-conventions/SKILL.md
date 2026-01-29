---
name: naming-conventions
description: Naming conventions for files, variables, types, constants, booleans, generics. Applies to new files, refactoring, code review, or inconsistent naming issues.
---

# Naming Conventions

## Quick Reference

| Category            | Convention             | Examples                               |
| ------------------- | ---------------------- | -------------------------------------- |
| Files               | `kebab-case`           | `order-form.tsx`, `checkout-modal.tsx` |
| Files (Convex)      | `snake_case`           | `convex/stripe_webhook.ts`             |
| Variables/Functions | `camelCase`            | `selectedAmount`, `handleSubmit`       |
| Types/Interfaces    | `PascalCase`           | `PaymentMethod`, `ButtonProps`         |
| Constants           | `camelCase + as const` | `minOrderAmount`                       |
| Generics            | Descriptive            | `TItem`, `TData`, `TError`             |
| Booleans            | Prefixed               | `isValid`, `hasError`, `canSubmit`     |
| DB/API Fields       | `snake_case`           | `transaction_id`, `_creationTime`      |

## Clear Prefixes

```ts
// Functions
function handleSubmit() {}
function getOrderTotal() {}
function isValidEmail() {}
function buildPayload() {}

// Booleans
const isLoading = true;
const hasError = false;
const canProceed = true;
const didComplete = false;
const willExpire = true;
const shouldRetry = false;
```

## Modern Constants

```ts
const bitcoinConfirmations = { mainnet: 3 } as const;
const paymentMethods = ["card", "bitcoin"] as const;
```

## Avoid Old Patterns

```ts
// ❌ ALL_CAPS (outdated)
const MAX_AMOUNT = 100;

// ❌ Single-letter generics (complex cases)
function map<T, U>(items: T[]): U[];

// ✅ Descriptive generics
function map<TItem, TResult>(items: TItem[]): TResult[];
```

## Named Exports (Default)

```ts
// ✅ Prefer named
export function OrderForm() {}
export const config = {};

// Default only when framework requires (Next.js pages)
export default function Page() {}
```

## Convex Exception

Convex requires `snake_case` for function files:

```ts
// ✅ convex/stripe_webhook.ts
// ✅ convex/bitcoin_mutations.ts
```

## Props Naming

```ts
interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
}

export function Button({ variant, onClick }: ButtonProps) {}
```
