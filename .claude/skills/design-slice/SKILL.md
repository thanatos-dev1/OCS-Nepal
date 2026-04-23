---
name: design-slice
description: Slice a design image or description into production-ready React components for OCS Nepal. Uses Next.js App Router, Tailwind CSS v4, Base UI, and project conventions.
version: 2.0.0
---

Slice the design provided in `$ARGUMENTS` into production-ready code for the OCS Nepal frontend.

The argument must be one of:
- A file path or URL to a design image (screenshot, mockup, Figma export)
- A textual description of the visual design to implement

---

## Phase 1 — Analyse the Design

Extract:
- Layout structure (grid, flex, sections, nesting)
- Spacing and sizing — map to Tailwind scale
- Colors — map to existing design tokens (`--color-primary`, `--color-accent`, `--color-text`, etc. from `src/app/globals.css`)
- Typography — map to Tailwind text utilities
- Interactive states (hover, active, disabled, focus)
- Component boundaries — which pieces are distinct reusable units

List findings before proceeding. If anything is ambiguous, state the decision you're making — do not block on minor unknowns.

---

## Phase 2 — Plan

Map the design to code:

1. **Component tree** — top-level component and sub-components
2. **Location** — `src/components/ui/` for primitives, `src/components/shop/` for shop sections, `src/components/admin/` for admin
3. **State & interactions** — list stateful behavior
4. **Props API** — TypeScript props based on what varies
5. **Variants** — if size/style variations exist, plan a `Record<Variant, string>` object

Share the plan and wait for approval before writing code.

---

## Phase 3 — Implement

### Stack (strictly follow)

- **Framework:** Next.js 16 App Router — `'use client'` only if state or event handlers are needed
- **Styling:** Tailwind CSS v4 — utility classes only; use `cn` from `@/lib/utils` for conditional classes
- **Variants:** plain `Record<Variant, string>` merged with `cn()` — no `cva`, no `tailwind-variants`
- **Primitives:** Base UI (`@base-ui/react`) for interactive elements (dialogs, dropdowns, tooltips, etc.)
- **Icons:** Lucide React — check existing usage before adding new icons
- **No inline styles** — all styling via Tailwind classes or CSS custom properties
- **No hardcoded hex colors** — use design tokens from `globals.css`
- **No hardcoded `gray-*` classes** — use semantic tokens (`text-text`, `bg-bg-subtle`, `border-border`, etc.)

### Design tokens reference

| Token | Usage |
|---|---|
| `bg-primary` / `text-primary` | Navy brand color |
| `hover:bg-primary-hover` | Primary hover state |
| `bg-accent` / `text-accent` | Orange CTA color |
| `hover:bg-accent-hover` | Accent hover state |
| `bg-bg` | Page background |
| `bg-bg-subtle` | Section / stripe background |
| `bg-bg-card` | Card background |
| `text-text` | Body / heading text |
| `text-text-muted` | Secondary labels |
| `text-text-disabled` | Disabled / placeholder |
| `border-border` | Default border |
| `border-border-strong` | Emphasized border |
| `text-success` / `bg-success-light` | Success states |
| `text-error` / `bg-error-light` | Error states |

### Fidelity rules

- Match spacing and proportions — prefer exact Tailwind scale values
- Add hover/active/focus states even if not shown — they're expected
- Mobile-first — use `sm:`, `md:`, `lg:` breakpoints
- Accessibility — `aria-*` attributes, keyboard navigation, `focus-visible` rings

---

## Phase 4 — Report

After files are written:

- **Files created** with paths
- **Usage snippet** — copy-pasteable import + JSX
- **Design decisions** — any assumptions or color mappings made
- **Deviations** — anything that couldn't be reproduced exactly and why
