# Wedding Budget Planner — Implementation Todo List

## Context
Phases 1–5 are complete. The design source of truth was updated to the Google Stitch "Wedding Budget App" project (editorial aesthetic, dusty rose palette, Noto Serif + Plus Jakarta Sans). Phase 5.5 refreshes the existing UI to match the new design system before continuing with feature pages.

---

## Phase 1: Project Scaffolding ✅

- [x] **1.1** Initialize Vite + React 18 + TypeScript project
- [x] **1.2** Install core dependencies: `tailwindcss`, `@tanstack/react-query`, `react-router-dom`, `firebase`
- [x] **1.3** Install UI dependencies: `shadcn/ui` (init), Radix UI primitives
- [x] **1.4** Configure Tailwind with design tokens from DESIGN-SPEC.MD
- [x] **1.5** Configure dark mode (Tailwind `class` strategy)
- [x] **1.6** Set up Firebase SDK config using `.env.local` variables
- [x] **1.7** Set up React Router with 4 routes: `/budget`, `/people`, `/summary`, `/settings`
- [x] **1.8** Set up React Query provider

---

## Phase 2: TypeScript Types & Firestore Layer ✅

- [x] **2.1** Define TypeScript types: `BudgetItem`, `Person`, `Assignment`, `Settings`
- [x] **2.2** Create Firestore service functions (CRUD for each collection)
- [x] **2.3** Implement cascading delete logic (budget item → descendants + assignments)
- [x] **2.4** Implement person delete cascade (person → all assignments)

---

## Phase 3: React Query Hooks ✅

- [x] **3.1** `useBudgetItems` — query + Firestore real-time listener
- [x] **3.2** `usePeople` — query + Firestore real-time listener
- [x] **3.3** `useAssignments` — query + Firestore real-time listener
- [x] **3.4** `useSettings` — query + Firestore real-time listener
- [x] **3.5** Mutation hooks for each entity (create/update/delete) with query invalidation
- [x] **3.6** `useBudgetTree` — client-side tree builder from flat budget items (memoized)

---

## Phase 4: Layout & Navigation ✅

- [x] **4.1** Desktop layout: collapsible sidebar (260px / 68px), state persisted in localStorage
- [x] **4.2** Mobile layout: top bar (56px) + bottom navigation (5 items)
- [x] **4.3** Mobile overlay sidebar
- [x] **4.4** Dark mode toggle (persisted in localStorage)
- [x] **4.5** Responsive breakpoint switching (768px)
- [x] **4.6** Smooth transitions (200ms)

---

## Phase 5: Shared UI Components ✅

- [x] **5.1** ProgressBar component (green 0-50%, yellow 50-80%, orange 80-100%, red >100%)
- [x] **5.2** StatCard component (for summary numbers)
- [x] **5.3** Avatar chips (for person assignments)
- [x] **5.4** Status badge (active/pending/closed with color indicators)
- [x] **5.5** Confirmation dialog (for deletes)
- [x] **5.6** Currency display helper (NPR/USD with exchange rate)

---

## Phase 5.5: Design System Refresh (Stitch Alignment) ✅

Update all existing UI to match the new "Ethereal Editor" design from Stitch.

- [x] **5.5.1** Update Tailwind config — replace old color tokens with new palette (primary `#805253`, secondary `#735A31`, tertiary `#6A5D43`, full surface hierarchy), update roundedness to `ROUND_EIGHT`, spacing scale to 3
- [x] **5.5.2** Install and configure fonts — Noto Serif (headlines/display) + Plus Jakarta Sans (body/labels), replace Inter references
- [x] **5.5.3** Update global styles — set `on-surface` (#1A1C1A) as default text color, `surface` (#FAF9F6) as background, ban pure black
- [x] **5.5.4** Restyle Layout components — apply glassmorphism to sidebar/topbar (backdrop-blur, 70% opacity), warm ivory surfaces, remove any 1px borders in favor of tonal layering
- [x] **5.5.5** Restyle ProgressBar — gradient from `primary` to `primary-container` for budget bars, keep threshold colors (green/yellow/orange/red), surface-container-high track
- [x] **5.5.6** Restyle StatCard — use surface hierarchy for depth (no borders), ambient shadow `0 20px 40px rgba(128, 82, 83, 0.06)`, `xl` rounding, serif heading font
- [x] **5.5.7** Restyle buttons — primary: `#805253` bg + `xl` rounding + letter-spacing; secondary: `#FDDBA7` gold; all variants rounded-xl
- [x] **5.5.8** Restyle input fields — `surface-container-low` bg, bottom-border-only, focus transitions to `surface-container-high` with primary glow
- [x] **5.5.9** Restyle Avatar chips & Status badges — `tertiary-container` (#BBAB8D) Dream Chip style, rounded full; status badges use primary/secondary tones
- [x] **5.5.10** Restyle dialogs/sheets/modals — glassmorphism overlay (backdrop-blur-md), ambient shadows, ghost ring at 5% opacity, removed hard borders
- [x] **5.5.11** Update dark mode tokens — "Velvet" aesthetic (deep charcoal surfaces, inner tonal glows, boosted rose/gold luminance, transparent borders)
- [x] **5.5.12** Visual QA — verified no pure black text, no 1px solid borders, consistent surface layering, select/popover also updated

**Files changed:** `package.json`, `src/index.css`, `src/components/layout/*.tsx`, `src/components/ui/*.tsx`

---

## Phase 5.6: Material Symbols Migration ✅

Migrated all icons from Lucide React to Material Symbols Outlined.

- [x] **5.6.1** Install `@material-symbols/font-400`, uninstall `lucide-react`
- [x] **5.6.2** Create `src/components/ui/icon.tsx` wrapper component (IconName type replaces LucideIcon)
- [x] **5.6.3** Add font import + CSS utilities (font-variation-settings) to `src/index.css`
- [x] **5.6.4** Migrate all UI components: stat-card, avatar-chip, dialog, sheet, select, button
- [x] **5.6.5** Migrate all layout components: Sidebar, TopBar, BottomNav, MobileSidebar
- [x] **5.6.6** Migrate all budget components: BudgetSummaryCards, BudgetItemRow, AssignPeople, BudgetPage
- [x] **5.6.7** Remove SVG sizing rule from button.tsx, verify zero lucide-react imports

---

## Phase 6: Budget Page ✅ (Editorial Redesign)

Redesigned from spreadsheet tree-table to editorial card/accordion layout matching Stitch.

- [x] **6.1** BudgetFinancialOverview — 2-card layout (Total Estimated, Spent So Far) with serif headings
- [x] **6.2** BudgetCategoryCard — expandable accordion card per top-level category
- [x] **6.3** BudgetSubItemCard — card for child/leaf items with inline status + assignments
- [x] **6.4** CategoryActionMenu — three-dot popover menu (edit/add/delete) replaces inline buttons
- [x] **6.5** BudgetCategoryList — container with SectionHeading + FilterBar + sorted cards
- [x] **6.6** QuoteBlock — editorial inspirational quote at page bottom
- [x] **6.7** FilterBar — sort dropdown (Default, Budget High→Low, Status)
- [x] **6.8** Rewritten BudgetPage — editorial layout with max-w-4xl, space-y-8, mobile FAB

**New files:** `BudgetFinancialOverview.tsx`, `BudgetCategoryCard.tsx`, `BudgetSubItemCard.tsx`, `BudgetCategoryList.tsx`, `CategoryActionMenu.tsx`, `section-heading.tsx`, `quote-block.tsx`, `filter-bar.tsx`, `icon.tsx`
**Deleted:** `BudgetTree.tsx`, `BudgetItemRow.tsx`, `BudgetSummaryCards.tsx`

---

## Phase 7: People Page ✅

- [x] **7.1** People grid — responsive 1-col/2-col grid of PersonCard components
- [x] **7.2** PersonCard — avatar initials, name, assignment count, edit/delete actions (hover reveal)
- [x] **7.3** PersonForm — dialog for add/edit with name field
- [x] **7.4** Delete person with cascade confirmation via ConfirmDialog

**Files created:** `src/pages/PeoplePage.tsx`, `src/components/people/PersonCard.tsx`, `src/components/people/PersonForm.tsx`

---

## Phase 8: Summary Page ✅

- [x] **8.1** StatCards — total budget, spent, remaining (3-card grid)
- [x] **8.2** Overall ProgressBar in editorial card
- [x] **8.3** CategoryBreakdown — per-root-category budget vs spent with progress bars
- [x] **8.4** Status grouping summary (active/pending/closed counts as stat cards)

**Files created:** `src/pages/SummaryPage.tsx`, `src/components/summary/CategoryBreakdown.tsx`

---

## Phase 9: Settings Page ✅

- [x] **9.1** Currency selector (NPR / USD) with Select component
- [x] **9.2** Exchange rate input with > 0 validation
- [x] **9.3** Save to Firestore via useUpdateSettings + "Saved!" feedback
- [x] **9.4** Dark mode toggle with theme description

**Files created:** `src/pages/SettingsPage.tsx`

---

## Phase 10: Polish & Validation ✅

- [x] **10.1** Input validation: budgetAmount ≥ 0, spentAmount ≥ 0 (min="0" on inputs), exchangeRate > 0 (validated in SettingsPage)
- [x] **10.2** Overspending visual flag — ProgressBar shows red at >100%, StatCard danger variant
- [x] **10.3** Lazy load non-critical pages — People, Summary, Settings use React.lazy() + Suspense (separate chunks in build)
- [x] **10.4** Memoize tree transformations — useBudgetTree uses useMemo for tree building and totals
- [ ] **10.5** Cross-browser testing — manual
- [ ] **10.6** Mobile responsiveness QA — manual

---

## Verification

1. `npm run dev` — app starts without errors
2. Create nested budget items → verify parent auto-calculates totals
3. Assign people to leaf items → verify avatar chips appear
4. Delete a parent item → verify cascade removes children + assignments
5. Delete a person → verify their assignments are removed
6. Toggle dark mode → verify persistence across reload
7. Switch currency → verify display updates
8. Resize to mobile → verify bottom nav, top bar, FAB appear
9. `npm run build` — production build succeeds
