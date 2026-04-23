You are helping create a new UI component for the OCS Nepal frontend.

The user has provided: $ARGUMENTS

Parse the arguments as: `<component-name> - <summary or design input>`

The second part (after the name) can be:
- A plain text summary of what the component does → follow the standard flow below
- A design image path or visual description → use the `design-slice` skill to analyse the design first

---

## Step 1 — Clarify before acting

Before writing any code, consider:

- Is the component's purpose and behavior fully clear?
- Are there variant/size decisions to make?
- Should it be a UI primitive (`src/components/ui/`) or feature-specific (`src/components/shop/`, `src/components/admin/`)?
- Does it need `'use client'`?

If anything is ambiguous, ask first. Do not create files until the goal is clear.

---

## Step 2 — Plan

Briefly outline:

1. **Responsibility** — one clear job
2. **Props API** — name props for intent, not implementation
3. **Variants** — if multiple visual styles exist, define them as a `Record<Variant, string>` object merged via `cn()`
4. **Client vs server** — add `'use client'` only if state or event handlers are needed
5. **Hook extraction** — if interaction logic is non-trivial, plan a `use<ComponentName>` hook

Share the plan and wait for approval before writing code.

---

## Step 3 — Create the component

**Location:**
- General-purpose primitive → `src/components/ui/<component-name>.tsx`
- Shop-facing section → `src/components/shop/<component-name>.tsx`
- Admin → `src/components/admin/<component-name>.tsx`
- Shared layout → `src/components/shared/<component-name>.tsx`

**Conventions:**
- `'use client'` at the top only if needed
- Import `cn` from `@/lib/utils`
- Variants use plain `Record<Variant, string>` + `cn()` — no external variant library
- Use Base UI (`@base-ui/react`) for interactive primitives (dialogs, dropdowns, tooltips, etc.)
- Use Lucide React for icons
- All colors via design tokens (`bg-primary`, `text-text-muted`, `bg-bg-subtle`, etc.) — no hardcoded hex or `gray-*` classes
- Prices always formatted as `NPR ${amount.toLocaleString("en-NP")}`
- Export the component as default

**Example variant pattern:**
```tsx
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  outline: "border border-border text-text hover:bg-bg-subtle",
};

export default function MyComponent({ variant = "primary", className, ...props }) {
  return <div className={cn(variants[variant], className)} {...props} />;
}
```

---

## Step 4 — Report back

After files are created, output:

- **File:** path to the component
- **Usage snippet** — copy-pasteable import + JSX
- Any follow-up suggestions (do not implement them)
