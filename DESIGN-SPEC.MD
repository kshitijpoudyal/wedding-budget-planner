# Design System

This document outlines the core design principles and token values for our digital products.

## Theme Overview

Our theme is designed with a **light** color mode (with dark mode support), providing a warm, inviting, and editorial experience.

## Color Palette

- **Primary Color:** `#1275e2` — Used for primary actions, interactive elements, and key brand accents.
- **Secondary Color:** `#5f78a3` — Supporting shade for secondary actions and less prominent UI elements.
- **Tertiary Color:** `#c55b00` — Warm accent for highlights, badges, and call-outs.
- **Neutral Color:** `#74777f` — Base for surfaces, muted text, and structural backgrounds.
- **Seed Color:** `#1978e5` — The generative seed color for the palette.

## Typography

We use **Inter** across the system for consistency and readability.

- **Category Headings:** `text-xl font-bold` — Commands attention; used for top-level budget category names.
- **Section Headings:** `text-lg font-semibold` — Page sections and sub-group titles.
- **Body Text:** `text-sm` or `text-base` — Comfortable reading for amounts, descriptions, vendor info.
- **Labels & Chips:** `text-xs font-medium` — Metadata, status badges, date pills.

**Principle:** Use scale contrast deliberately. A bold `text-xl` heading paired with `text-xs` metadata creates editorial tension and visual hierarchy.

## Shape and Spacing

- **Roundedness:** `rounded-xl` for cards, `rounded-full` for chips and badges, `rounded-md` for buttons and inputs.
- **Spacing:** Prefer generous spacing — `p-5`, `p-6`, `gap-4`, `gap-6` — to give elements room to breathe. Avoid cramped 8px or 12px padding in card containers.

## Surface Hierarchy & The No-Line Rule

**No 1px borders for sectioning.** Structural separation is achieved through background color shifts, not lines.

| Layer | Purpose | Example |
|-------|---------|---------|
| Layer 0 — Base | Page background | `bg-background` |
| Layer 1 — Grouped | Section containers | Slightly warm page tint |
| Layer 2 — Elevated | Category cards | Vivid color fill (see Card Colors) |
| Layer 3 — Nested | Sub-item cards | Lighter tint of same color |

This creates a "physical layers of paper" feel — depth without a single pixel of border.

## Card Color System

Each budget category is deterministically assigned one of 8 color families. Cards use two tonal layers:

- **Parent card (`cardBg`):** `bg-*-200` — Richly colored, clearly distinct. This is the main "pocket of color" that identifies a category at a glance.
- **Sub-item card (`subCardBg`):** `bg-*-100` — A lighter tint of the same hue. Visually nested inside the parent without needing a border.

**Dark mode:** Parent cards use `bg-*-900/60` and sub-items use `bg-*-900/40` for readable depth.

**Available color families:** blue, orange, emerald, violet, rose, amber, teal, fuchsia.

## Elevation

Depth is conveyed through **tonal layering**, not drop shadows.

- **Cards on page background:** The `*-200` fill against the neutral page background creates a natural "lift."
- **Ambient shadow (optional float):** When a float is needed (e.g. FAB, modal), use `shadow-sm` — a soft, barely-there lift. Never use hard or heavily opaque shadows.
- **No decorative borders:** If a boundary must be accessibility-legible, use `ring-1 ring-black/5` at very low opacity — felt, not seen.

## Component Guidelines

### Cards
- No left-side color borders. The full card background carries the color.
- Use `rounded-xl overflow-hidden` on the container.
- Inner padding: `p-5 md:p-6` for category cards; `p-3 md:p-4` for sub-item cards.

### Buttons
- **Primary:** Solid `bg-primary` with `text-primary-foreground`. `rounded-md`. No shadow.
- **Secondary:** Muted surface background with `text-muted-foreground`.
- **Destructive:** `bg-destructive/10 text-destructive` for soft-destructive actions.

### Status Chips & Badges
- Small, rounded-full pills: `px-2 py-0.5 rounded-full text-xs font-medium`.
- Use category color `chipBg` and `text-*` classes for category chips.
- System status badges (complete, pending, overdue) use semantic colors from the design token set.

### Input Fields
- Fill: `bg-background` or `bg-muted/40`.
- Focus state: `ring-2 ring-primary` — do not change border color on focus, use ring instead.
- Label: `text-sm font-medium text-foreground` positioned above the field.

### Progress Bars
- Green (0–50%), Yellow (50–80%), Orange (80–100%), Red (>100%).
- Overspending is allowed but visually flagged — red fill + red variance pill.

## Do's and Don'ts

### Do
- Use the card background color as the primary visual identifier for a category (not a left border).
- Embrace tonal contrast between parent cards (`*-200`) and their children (`*-100`).
- Use generous spacing — `24px`, `32px` — to let each element command attention.
- Keep chips and badges small and secondary; they accent, not dominate.

### Don't
- Don't use 1px `border-l-*` or `divide-*` lines as structural separators.
- Don't use `*-50` card backgrounds — they're too pale to read as "colorful."
- Don't add drop shadows for depth — let tonal layering do that work.
- Don't use pure black (`#000`). Use `text-foreground` (dark slate) for a softer, organic feel.
