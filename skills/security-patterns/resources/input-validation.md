# Input Validation Patterns

Comprehensive patterns for input validation using Zod with proper constraints and error handling.

## Basic Patterns

### String Validation

```ts
import { z } from "zod"

// Name validation
const nameSchema = z.string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .trim()

// Email validation
const emailSchema = z.string()
  .email("Invalid email format")
  .max(255, "Email too long")
  .toLowerCase()

// URL validation
const urlSchema = z.string()
  .url("Invalid URL")
  .max(2048, "URL too long")

// Phone validation (E.164 format)
const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
  .optional()
```

### Number Validation

```ts
// Positive amounts
const amountSchema = z.number()
  .positive("Amount must be positive")
  .max(1000000, "Amount too large")
  .multipleOf(0.01, "Max 2 decimal places")

// Integer validation
const quantitySchema = z.number()
  .int("Must be whole number")
  .min(1, "Minimum 1")
  .max(1000, "Maximum 1000")

// Bitcoin satoshis
const satoshiSchema = z.number()
  .int("Must be whole number")
  .positive("Must be positive")
  .max(21_000_000 * 100_000_000, "Exceeds max Bitcoin supply")
```

### Date Validation

```ts
// ISO date string
const dateSchema = z.string()
  .datetime("Invalid date format")

// Date object
const dateObjSchema = z.date()
  .min(new Date("2020-01-01"), "Date too old")
  .max(new Date("2030-12-31"), "Date too far in future")

// Unix timestamp
const timestampSchema = z.number()
  .int("Must be integer")
  .positive("Must be positive")
  .max(2147483647, "Invalid timestamp") // Max 32-bit timestamp
```

## Complex Validation

### Discriminated Unions

```ts
// Payment method validation
const paymentMethodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("card"),
    cardNumber: z.string().regex(/^\d{16}$/),
    cvv: z.string().regex(/^\d{3,4}$/)
  }),
  z.object({
    type: z.literal("bitcoin"),
    address: z.string().regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/),
    network: z.enum(["mainnet", "testnet"])
  })
])
```

### Nested Objects

```ts
const orderSchema = z.object({
  customer: z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema
  }),
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: quantitySchema,
    price: amountSchema
  })).min(1, "At least one item required").max(100, "Too many items"),
  total: amountSchema
})
```

### Conditional Validation

```ts
const userSchema = z.object({
  type: z.enum(["individual", "business"]),
  name: z.string().min(1).max(100),
  businessName: z.string().min(1).max(200).optional(),
  taxId: z.string().optional()
}).refine(
  (data) => {
    // Business users must provide businessName and taxId
    if (data.type === "business") {
      return data.businessName && data.taxId
    }
    return true
  },
  {
    message: "Business users must provide business name and tax ID"
  }
)
```

## Error Handling

### Safe Parsing with Result Types

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

const validateInput = <T>(
  schema: z.ZodSchema<T>,
  input: unknown
): Result<T, z.ZodError> => {
  const result = schema.safeParse(input)
  if (!result.success) {
    return { ok: false, error: result.error }
  }
  return { ok: true, value: result.data }
}

// Usage
const result = validateInput(orderSchema, userInput)
if (!result.ok) {
  // Handle error
  console.error(result.error.format())
  return
}

// TypeScript knows result.value is valid Order
const order = result.value
```

### Custom Error Messages

```ts
const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character")
```

## Sanitization

### Automatic Transforms

```ts
// Trim and lowercase email
const emailSchema = z.string()
  .email()
  .trim()
  .toLowerCase()

// Remove non-numeric characters from phone
const phoneSchema = z.string()
  .transform((val) => val.replace(/[^0-9+]/g, ""))
  .regex(/^\+?[1-9]\d{1,14}$/)

// Parse JSON string
const jsonSchema = z.string()
  .transform((str) => {
    try {
      return JSON.parse(str)
    } catch {
      throw new Error("Invalid JSON")
    }
  })
```

## Server-Side Validation

### Convex Mutation Validation

```ts
import { mutation } from "./_generated/server"
import { z } from "zod"

const createOrderArgs = z.object({
  customerEmail: emailSchema,
  items: z.array(z.object({
    productId: z.string(),
    quantity: quantitySchema
  })),
  total: amountSchema
})

export const createOrder = mutation({
  args: {},
  handler: async (ctx, rawArgs) => {
    // Validate args
    const result = validateInput(createOrderArgs, rawArgs)
    if (!result.ok) {
      throw new Error(`Validation failed: ${result.error.message}`)
    }

    const args = result.value

    // Now safe to use validated args
    const orderId = await ctx.db.insert("orders", {
      customer_email: args.customerEmail,
      items: args.items,
      total: args.total,
      status: "pending"
    })

    return orderId
  }
})
```

## Testing Validation

```ts
import { describe, it, expect } from "vitest"

describe("orderSchema validation", () => {
  it("accepts valid order", () => {
    const validOrder = {
      customer: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+14155552671"
      },
      items: [{ id: "uuid-here", quantity: 2, price: 99.99 }],
      total: 199.98
    }

    const result = orderSchema.safeParse(validOrder)
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const invalidOrder = {
      customer: {
        name: "John Doe",
        email: "invalid-email",
        phone: "+14155552671"
      },
      items: [{ id: "uuid-here", quantity: 2, price: 99.99 }],
      total: 199.98
    }

    const result = orderSchema.safeParse(invalidOrder)
    expect(result.success).toBe(false)
  })

  it("rejects negative amounts", () => {
    const invalidOrder = {
      customer: {
        name: "John Doe",
        email: "john@example.com"
      },
      items: [{ id: "uuid-here", quantity: 2, price: -99.99 }],
      total: -199.98
    }

    const result = orderSchema.safeParse(invalidOrder)
    expect(result.success).toBe(false)
  })
})
```

## Best Practices

1. **Always use `.safeParse()`** instead of `.parse()` - returns Result, doesn't throw
2. **Add constraints** - `.min()`, `.max()`, `.trim()`, `.toLowerCase()`, etc.
3. **Validate at boundaries** - API endpoints, webhook handlers, form submissions
4. **Test edge cases** - empty strings, null, undefined, max values, special characters
5. **Sanitize before validation** - trim whitespace, lowercase emails, remove formatting
6. **Return specific errors** - help users fix their input
7. **Never trust client input** - always validate server-side
