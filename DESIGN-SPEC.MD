# Design System

> **Source of Truth:** Google Stitch project "Wedding Budget App" (`projects/10193263880010569798`), device: Mobile.
> This document is derived from the Stitch design system. When in doubt, pull the latest from Stitch.

## Creative North Star: "The Ethereal Editor"

We move away from the "utility-first" spreadsheet look of traditional budget planners toward a high-end, editorial wedding magazine experience. The system uses **intentional asymmetry**, **overlapping editorial elements**, and **tonal depth** to create a sense of calm and romance. Every budget category is a "feature story," not a row in a table. Exaggerated white space (Spacing 16 and 24) and shifting surface containers create a rhythmic, melodic flow.

## Theme Overview

- **Color Mode:** Light
- **Color Variant:** Fidelity
- **Roundedness:** 8 (`ROUND_EIGHT`)
- **Spacing Scale:** 3

## Color Palette

### Brand Colors

| Role | Hex | Usage |
|------|-----|-------|
| **Primary** | `#C08B8B` | Override primary — dusty rose foundation |
| **Secondary** | `#D4B483` | Override secondary — warm gold accents |
| **Tertiary** | `#E5D3B3` | Override tertiary — soft champagne |
| **Neutral** | `#FAF9F6` | Override neutral — warm ivory base |
| **Custom/Seed** | `#D4A373` | Generative seed color |

### Full Token Map

| Token | Hex |
|-------|-----|
| `primary` | `#805253` |
| `primary-container` | `#D69F9E` |
| `primary-fixed` | `#FFDAD9` |
| `primary-fixed-dim` | `#F2B8B8` |
| `on-primary` | `#FFFFFF` |
| `on-primary-container` | `#5D3536` |
| `on-primary-fixed` | `#321113` |
| `on-primary-fixed-variant` | `#653B3C` |
| `secondary` | `#735A31` |
| `secondary-container` | `#FDDBA7` |
| `secondary-fixed` | `#FFDEAC` |
| `secondary-fixed-dim` | `#E3C290` |
| `on-secondary` | `#FFFFFF` |
| `on-secondary-container` | `#785F35` |
| `on-secondary-fixed` | `#281900` |
| `on-secondary-fixed-variant` | `#59431C` |
| `tertiary` | `#6A5D43` |
| `tertiary-container` | `#BBAB8D` |
| `tertiary-fixed` | `#F3E0C0` |
| `tertiary-fixed-dim` | `#D6C4A5` |
| `on-tertiary` | `#FFFFFF` |
| `on-tertiary-container` | `#4B3F28` |
| `on-tertiary-fixed` | `#231A06` |
| `on-tertiary-fixed-variant` | `#51452D` |
| `surface` | `#FAF9F6` |
| `surface-bright` | `#FAF9F6` |
| `surface-dim` | `#DBDAD7` |
| `surface-tint` | `#805253` |
| `surface-variant` | `#E3E2E0` |
| `surface-container` | `#EFEEEB` |
| `surface-container-high` | `#E9E8E5` |
| `surface-container-highest` | `#E3E2E0` |
| `surface-container-low` | `#F4F3F1` |
| `surface-container-lowest` | `#FFFFFF` |
| `background` | `#FAF9F6` |
| `on-background` | `#1A1C1A` |
| `on-surface` | `#1A1C1A` |
| `on-surface-variant` | `#50453B` |
| `outline` | `#82756A` |
| `outline-variant` | `#D4C4B7` |
| `inverse-surface` | `#2F312F` |
| `inverse-on-surface` | `#F2F1EE` |
| `inverse-primary` | `#F2B8B8` |
| `error` | `#BA1A1A` |
| `error-container` | `#FFDAD6` |
| `on-error` | `#FFFFFF` |
| `on-error-container` | `#93000A` |

### Surface Philosophy

- **"No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries are defined solely through background color shifts.
- **Surface Hierarchy:** Treat the UI as physical layers of fine paper.
  - **Base Layer:** `surface` (#FAF9F6)
  - **Secondary Content:** `surface-container-low` (#F4F3F1)
  - **Interactive Cards:** `surface-container-lowest` (#FFFFFF) for a "pure" lift
- **Glass & Gradient:** Floating modals and navigation bars use **Glassmorphism** — 20px backdrop-blur on 70% opaque `surface-container-lowest`.
- **Signature Textures:** Subtle linear gradients (from `primary` to `primary-container`) for progress bars or hero CTAs.

## Typography

| Level | Token | Font | Size | Intent |
|-------|-------|------|------|--------|
| **Display** | `display-lg` | Noto Serif | 3.5rem | High-impact budget totals, celebratory milestones |
| **Headline** | `headline-md` | Noto Serif | 1.75rem | Category titles (e.g., "The Venue," "Floral Design") |
| **Title** | `title-lg` | Plus Jakarta Sans | 1.375rem | Sub-section headers and card titles |
| **Body** | `body-md` | Plus Jakarta Sans | 0.875rem | General data entry and descriptions |
| **Label** | `label-md` | Plus Jakarta Sans | 0.75rem | Metadata, caps-spaced for a premium "tag" look |

- **Headlines:** Noto Serif
- **Body Text:** Plus Jakarta Sans (mapped from `PLUS_JAKARTA_SANS`)
- **Labels:** Plus Jakarta Sans

**Editorial Note:** Use `headline-lg` for large, asymmetrical quotes or "Money Tips" to break the vertical rhythm of the budget list.

## Elevation & Depth

Depth is achieved through **Tonal Layering**, not structural lines.

- **The Layering Principle:** Avoid shadows for static elements. A `surface-container-highest` card on a `surface` background provides enough contrast to be "felt" without being "seen."
- **Ambient Shadows:** For floating elements (Modals, Hovered Cards): `box-shadow: 0 20px 40px rgba(128, 82, 83, 0.06);` — tinted with `primary` to mimic warm reflected light.
- **"Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` at 15% opacity. Never use 100% opaque borders.
- **Glassmorphism:** Use `surface-tint` at 5% opacity over a blurred background for fixed navigation headers.

## Components

### Buttons

- **Primary:** `primary` (#805253) background with `on-primary` text. Use `xl` (1.5rem) rounding. Add 1.5px letter-spacing to the label.
- **Secondary:** `secondary-container` (#FDDBA7) background. "Subtle Gold" — soft accent, not a warning.
- **Tertiary:** No background. `primary` text with a `surface-variant` underline that expands on hover.

### Input Fields

- **Styling:** No "box" look. Use `surface-container-low` background with `sm` (0.25rem) bottom-only radius.
- **Interaction:** On focus, background transitions to `surface-container-highest` with a soft `primary` glow.

### Cards & Lists

- **Divider Ban:** Vertical dividers are forbidden. Use Spacing `8` (2.75rem) for major categories, Spacing `4` (1.4rem) for line items.
- **Asymmetric Cards:** Budget Summary cards span 60% of container width, offset to the right, for an editorial layout.

### The "Dream Chip"

- **Context:** Tags for expenses (e.g., "Must-Have," "Wishlist").
- **Style:** `tertiary-container` (#BBAB8D) background with `on-tertiary-container` text. Rounded `full`. Should feel like small silk ribbons.

## Do's and Don'ts

### Do

- Use negative space as a functional element. If a screen feels "busy," add Spacing `12` or `16` between sections.
- Use `primary-fixed-dim` (#F2B8B8) for background washes on large empty states.
- Align serif typography (Noto Serif) to the left with generous leading to maintain the editorial feel.

### Don't

- Use pure black (#000000) for text. Always use `on-surface` (#1A1C1A) for the soft, romantic tonal range.
- Use standard 4px rounded corners. Use `lg` (1rem) or `xl` (1.5rem) for the "Soft Minimalism" theme.
- Use high-contrast "Success" greens. Use `secondary` (#735A31) gold tones for "Paid" or "Completed" status.
