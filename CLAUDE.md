# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding Budget Planner — a responsive web app for managing wedding finances through hierarchical budgeting, person assignments, multi-currency support, and real-time financial tracking.

**Status:** Pre-implementation. Planning artifacts exist in `.specify/` and `.github/agents/`. No application source code has been written yet.

## Source of Truth Documents

> **Important:** These documents are the authoritative sources. Do not duplicate their content here.

| Document | Contains |
|----------|----------|
| [TECH-SPEC.MD](TECH-SPEC.MD) | Tech stack, data models, Firestore structure, features, pages, data fetching, validation, performance |
| [DESIGN-SPEC.MD](DESIGN-SPEC.MD) | Color palette, typography, shape/spacing tokens |

## Architectural Rules (Quick Reference)

These rules are derived from the constitution. See `.specify/memory/constitution.md` for full details.

**Data layer:**
- All data fetching through React Query hooks — no direct Firestore calls outside query/mutation hooks
- All mutations must invalidate relevant queries — optimistic updates where appropriate

**Budget hierarchy:**
- Parent items auto-calculate `budgetAmount` and `spentAmount` from children (NEVER manually editable)
- Only leaf nodes can have editable amounts and people assignments
- Assignments are many-to-many at leaf level only

**Cascade behavior:**
- Person deletion → remove all related assignments
- Budget item deletion → recursively delete all descendants + related assignments

**UI constraints:**
- No inline styles — Tailwind CSS only
- Progress bar colors: Green (0-50%), Yellow (50-80%), Orange (80-100%), Red (>100%)
- Overspending allowed but visually flagged (red indicator at >100%)
- Dark mode toggle persists in localStorage
- Smooth transitions — 200ms duration

**Scope boundaries:**
- Future enhancements (CSV export, notes, budget cap, analytics, auth, offline support) are NOT to be implemented until formally added to constitution

## Responsive Breakpoints

| Viewport | Layout |
|----------|--------|
| Desktop (≥768px) | Collapsible sidebar (260px/68px), hover interactions, sidebar state in localStorage |
| Mobile (<768px) | Top bar (56px), bottom navigation (5 items), overlay sidebar, floating action buttons |

## Environment Setup

```bash
cp .env.example .env.local
# Fill in Firebase credentials
```

### Dev Scripts
```bash
npm run dev
npm run build
npm run preview
```

## Planning Framework (Speckit)

Key files:
- `.specify/memory/constitution.md` — project constitution (read this first)
- `.specify/templates/` — templates for specs, plans, tasks, checklists
- `.github/agents/` — Speckit agent definitions
- `.github/prompts/` — prompt files for Speckit agents

Workflow: constitution → specification → plan → tasks → checklists → implement
