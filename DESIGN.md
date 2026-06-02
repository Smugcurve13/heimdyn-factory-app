# Heimdyn — Design System (DESIGN.md)

> **Source of truth for all UI styling in Phase 2.** This file describes the design system as it maps to *this repo's actual setup* — shadcn/ui tokens defined as HSL CSS variables in `global.css` and consumed via `tailwind.config.ts`. Do NOT invent new class names (e.g. `surface-container`); use only the semantic tokens below. The `cn()` helper (`clsx` + `tailwind-merge`) is used for conditional classes.

---

## 1. How theming works in this repo

- Colors are **semantic CSS variables** in `global.css`, referenced in Tailwind as `hsl(var(--token))`.
- You style with semantic utility classes: `bg-background`, `bg-card`, `text-foreground`, `border-border`, `bg-primary`, `bg-sidebar`, etc. — NOT raw hex.
- To change a colour, edit the variable value in `global.css`. Never hardcode hex in components.
- Radii come from `--radius` (`rounded-lg` / `rounded-md` / `rounded-sm`).
- The app runs in **dark mode** (`class="dark"` on the root). All values below are the dark palette.

---

## 2. Brand & personality

Functional, technical, hyper-focused — a "developer-tool" aesthetic inspired by Linear and Vercel, not a cluttered legacy ERP. Dark-mode-first to reduce eye strain on long shifts. Data is the primary interface element. Minimalist and modern: deep slate surfaces, sharp typography, generous whitespace separating dense data.

**Golden rules:**
- No drop shadows. Hierarchy comes from tonal layering + 1px borders.
- Numerical data (stock, costs, IDs) is right-aligned and monospaced.
- Status is shown with pill-shaped tags using low-opacity colour fills, never heavy blocks.

---

## 3. Color tokens (dark palette)

Paste these into the `.dark` block in `global.css`. Values are HSL (the format shadcn expects — no `hsl()` wrapper in the variable itself).

```css
.dark {
  --background: 222 39% 8%;          /* #10131A app canvas */
  --foreground: 222 20% 90%;         /* #E1E2EC primary text */

  --card: 223 17% 14%;               /* #1D2027 cards / surfaces */
  --card-foreground: 222 20% 90%;

  --popover: 223 17% 12%;            /* drawers, menus */
  --popover-foreground: 222 20% 90%;

  --primary: 222 100% 84%;           /* #ADC6FF accent (actions, active) */
  --primary-foreground: 220 100% 21%;/* #002E6A text on primary */

  --secondary: 220 30% 32%;          /* muted blue containers */
  --secondary-foreground: 222 20% 90%;

  --muted: 223 14% 20%;              /* subtle backgrounds */
  --muted-foreground: 220 14% 70%;   /* #C2C6D6 secondary text */

  --accent: 223 17% 18%;             /* hover surface */
  --accent-foreground: 222 20% 90%;

  --destructive: 4 100% 84%;         /* #FFB4AB error/reject */
  --destructive-foreground: 356 100% 21%;

  --border: 220 12% 30%;             /* #424754 1px borders */
  --input: 220 12% 30%;
  --ring: 222 100% 84%;              /* focus ring = primary */

  --radius: 0.5rem;                  /* 8px default */

  /* Sidebar (dedicated token group in tailwind.config) */
  --sidebar-background: 224 28% 6%;  /* #0B0E15 deepest layer */
  --sidebar-foreground: 220 14% 70%;
  --sidebar-primary: 222 100% 84%;
  --sidebar-primary-foreground: 220 100% 21%;
  --sidebar-accent: 223 17% 18%;
  --sidebar-accent-foreground: 222 20% 90%;
  --sidebar-border: 220 12% 26%;
  --sidebar-ring: 222 100% 84%;
}
```

**Usage cheat-sheet:**

| Need | Class |
|---|---|
| Page canvas | `bg-background` |
| Card / panel | `bg-card border border-border` |
| Drawer / popover | `bg-popover` |
| Primary button | `bg-primary text-primary-foreground` |
| Secondary/ghost button | `border border-border text-foreground` (transparent bg) |
| Body text | `text-foreground` |
| Muted/secondary text | `text-muted-foreground` |
| Hover row/surface | `hover:bg-accent` |
| Error / reject | `text-destructive` / `bg-destructive` |
| Sidebar | `bg-sidebar text-sidebar-foreground` |

---

## 4. Status colors (semantic — for pills)

These are not theme tokens; apply them directly as low-opacity fills so they read on the dark canvas. Use the same set everywhere for consistency.

| Status | Suggested classes |
|---|---|
| Draft / neutral | `bg-muted text-muted-foreground` |
| Pending Approval | `bg-amber-500/10 text-amber-400 border border-amber-500/20` |
| Planned | `bg-yellow-500/10 text-yellow-400 border border-yellow-500/20` |
| In Progress / Approved / active | `bg-blue-500/10 text-blue-300 border border-blue-400/20` |
| Done / Sufficient / Received | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` |
| Rejected / Insufficient / Requires MO | `bg-red-500/10 text-red-400 border border-red-500/20` |
| Badge: "PO Raised" | `bg-blue-500/15 text-blue-300 border border-blue-400/25` |

Pills are **full-radius** (`rounded-full`), `text-xs`, padded `px-2 py-0.5`, to distinguish them from buttons (which use `rounded-lg`).

---

## 5. Typography

- **Inter** for everything (UI + body) — best legibility in data-heavy screens.
- **Geist / monospace** for technical labels, IDs, serial numbers, and all numeric data.
- Headlines: tight letter-spacing at larger sizes (the "Linear" look).
- Body default: 14px (`text-sm`) for density without losing readability.
- Tiny labels: uppercase, `text-xs`, slightly tracked, for scannable dense forms.

| Role | Size / weight |
|---|---|
| Display | 36px / 600, tight tracking |
| Headline lg | 24px / 600 |
| Headline md | 20px / 500 |
| Body | 14px / 400 |
| Label sm | 12px / 500, uppercase |

---

## 6. Layout & spacing

- **Fixed sidebar:** 240px, `bg-sidebar`, full height, left.
- **Main content:** fluid, max readable width ~1440px, centered on ultra-wide monitors.
- **Detail drawer:** **480px fixed width**, slides in from the right, fully contained in the viewport (never cut off). Background `bg-popover`, 1px left border, optional `backdrop-blur` on the layer beneath.
- **Spacing scale:** strict 8px stepping. Tables/lists use compact (32px) or standard (40px) row heights.
- 12-column grid, 16px gutters.

---

## 7. Elevation & depth

Tonal layering, never shadows.

| Level | Token | Use |
|---|---|---|
| 0 | `bg-background` | page canvas |
| 1 | `bg-card` + `border-border` | cards, panels |
| 2 | `bg-popover` (+ optional `backdrop-blur`) | drawers, overlays, menus |

Hierarchy = border contrast + subtle background shifts. Avoid all `shadow-*`.

---

## 8. Components

### Buttons
- **Primary:** `bg-primary text-primary-foreground rounded-lg` — solid, no gradient.
- **Secondary:** transparent + `border border-border text-foreground rounded-lg`.
- **Ghost:** no bg/border, `text-primary`.

### Tables (critical for ERP)
- Alternating rows: even transparent, odd `bg-card/50`.
- Hover: `hover:bg-accent`.
- Numeric columns right-aligned + monospace.
- Header row: `bg-card` or sticky `bg-sidebar`, `text-muted-foreground`, uppercase labels.

### Inputs
- `bg-background border border-border rounded-lg` — "etched" look.
- Focus: border shifts to `ring` (primary), no outer glow.

### Sidebar nav
- `bg-sidebar`. Active item: 2px left bar in primary + text in `foreground`; inactive in `sidebar-foreground` with `hover:bg-sidebar-accent`.

### Cards (KPI / dashboard)
- `bg-card border border-border rounded-lg p-4`. Big number in `text-foreground` or `text-primary`, small uppercase label in `text-muted-foreground`.

### Status pills
- See §4. `rounded-full`, `text-xs`, low-opacity fills.

### Document Trail
- Horizontal chain of pill-boxes (e.g. SO → MO → PO) joined by arrow glyphs. Current node highlighted with `border-primary` + `ring-1 ring-primary/20`; others `bg-card border-border`. Each node is a clickable link to that document.

---

## 9. Shapes

- Default radius 8px (`rounded-lg`) — buttons, inputs, cards.
- Status pills: `rounded-full`.
- Checkboxes: small 4px radius for a sharp, technical feel.

---

## 10. Do / Don't

**Do**
- Use semantic tokens (`bg-card`, `text-foreground`, `bg-sidebar`).
- Keep one reusable list + drawer component across modules.
- Right-align and monospace all numbers and IDs.
- Use the status pill set from §4 consistently.

**Don't**
- Don't use Material-style names like `surface-container`, `on-surface-variant` — they don't exist in this repo.
- Don't hardcode hex in components; change `global.css` variables instead.
- Don't add drop shadows.
- Don't introduce new fonts or accent colours.
