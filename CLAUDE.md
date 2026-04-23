# OCS Nepal — Frontend

E-commerce platform for a computer hardware retailer in Nepal. Sells RAM, SSDs, hard drives, keyboards, and PC accessories.

## Stack

- **Framework:** Next.js 16, App Router, TypeScript (strict)
- **Styling:** Tailwind CSS v4 — all design tokens live in `src/app/globals.css`
- **Components:** Base UI (`@base-ui/react`) for interactive primitives, custom components in `src/components/`
- **State:** Zustand (`src/stores/`)
- **HTTP:** Axios instance (`src/lib/api.ts`)
- **Icons:** Lucide React
- **Package manager:** Yarn

## Design Tokens

All colors, radii, shadows, and z-index values are defined as CSS custom properties in `src/app/globals.css` under `@theme`. Do not hardcode hex values in components — use the token classes:

| Purpose         | Class                              |
| --------------- | ---------------------------------- |
| Brand navy      | `bg-primary`, `text-primary`       |
| CTA orange      | `bg-accent`, `text-accent`         |
| Page background | `bg-bg`                            |
| Section stripe  | `bg-bg-subtle`                     |
| Body text       | `text-text`                        |
| Secondary text  | `text-text-muted`                  |
| Default border  | `border-border`                    |
| Success         | `text-success`, `bg-success-light` |
| Error           | `text-error`, `bg-error-light`     |

Hover/active shades follow the pattern: `hover:bg-primary-hover`, `active:bg-primary-active`, etc.

## Component Conventions

- **Variants** are defined with plain `Record<Variant, string>` objects merged via `cn()` — no `cva` dependency
- **UI primitives** live in `src/components/ui/` (Button, etc.)
- **Shop-facing sections** live in `src/components/shop/` (Hero, CategoryGrid, FeaturedProducts, etc.)
- **Shared layout** lives in `src/components/shared/` (Navbar, Footer)
- **Admin components** live in `src/components/admin/`

## Currency & Locale

Always format prices as `NPR ${amount.toLocaleString("en-NP")}`. Never use `$` or other currencies.

## User Roles

- `customer` — public shop
- `staff` — order management only
- `owner` — full admin access

## Backend

Go + Gin API — **not started yet**. All data is currently mocked. When the API is ready, replace mock data with Axios calls using the instance from `src/lib/api.ts` (base URL from `NEXT_PUBLIC_API_URL`).

## Key Rules

- Read `node_modules/next/dist/docs/` before using any Next.js API — this version has breaking changes
- `params` in dynamic routes is a **Promise** — always `await` it
- `PageProps<'/route'>` is a globally available type — do not import it
- No inline hex colors — use design tokens
- No hardcoded `gray-*` Tailwind classes — use semantic tokens (`text-text`, `bg-bg-subtle`, etc.)
