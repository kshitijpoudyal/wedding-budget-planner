# Wedding Budget Planner — Implementation Todo List

## Context
The project is pre-implementation. Only planning docs exist (`TECH-SPEC.MD`, `DESIGN-SPEC.MD`, `CLAUDE.md`). This plan breaks the full build into ordered, dependency-aware phases.

---

## Phase 1: Project Scaffolding

- [ ] **1.1** Initialize Vite + React 18 + TypeScript project
- [ ] **1.2** Install core dependencies: `tailwindcss`, `@tanstack/react-query`, `react-router-dom`, `firebase`
- [ ] **1.3** Install UI dependencies: `shadcn/ui` (init), Radix UI primitives
- [ ] **1.4** Configure Tailwind with design tokens from DESIGN-SPEC.MD (colors, Inter font, spacing/roundedness)
- [ ] **1.5** Configure dark mode (Tailwind `class` strategy)
- [ ] **1.6** Set up Firebase SDK config using `.env.local` variables
- [ ] **1.7** Set up React Router with 4 routes: `/budget`, `/people`, `/summary`, `/settings`
- [ ] **1.8** Set up React Query provider

**Files created:** `package.json`, `vite.config.ts`, `tailwind.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/lib/firebase.ts`, `src/lib/queryClient.ts`

---

## Phase 2: TypeScript Types & Firestore Layer

- [ ] **2.1** Define TypeScript types: `BudgetItem`, `Person`, `Assignment`, `Settings`
- [ ] **2.2** Create Firestore service functions (CRUD for each collection)
  - `src/services/budgetItems.ts` — getAll, create, update, delete
  - `src/services/people.ts` — getAll, create, update, delete
  - `src/services/assignments.ts` — getAll, create, delete, deleteByPerson, deleteByBudgetItem
  - `src/services/settings.ts` — get, update
- [ ] **2.3** Implement cascading delete logic (budget item → descendants + assignments)
- [ ] **2.4** Implement person delete cascade (person → all assignments)

**Files created:** `src/types/index.ts`, `src/services/*.ts`

---

## Phase 3: React Query Hooks

- [ ] **3.1** `useBudgetItems` — query + Firestore real-time listener
- [ ] **3.2** `usePeople` — query + Firestore real-time listener
- [ ] **3.3** `useAssignments` — query + Firestore real-time listener
- [ ] **3.4** `useSettings` — query + Firestore real-time listener
- [ ] **3.5** Mutation hooks for each entity (create/update/delete) with query invalidation
- [ ] **3.6** `useBudgetTree` — client-side tree builder from flat budget items (memoized)

**Files created:** `src/hooks/useBudgetItems.ts`, `src/hooks/usePeople.ts`, `src/hooks/useAssignments.ts`, `src/hooks/useSettings.ts`, `src/hooks/useBudgetTree.ts`

---

## Phase 4: Layout & Navigation

- [ ] **4.1** Desktop layout: collapsible sidebar (260px / 68px), state persisted in localStorage
- [ ] **4.2** Mobile layout: top bar (56px) + bottom navigation (5 items)
- [ ] **4.3** Mobile overlay sidebar
- [ ] **4.4** Dark mode toggle (persisted in localStorage)
- [ ] **4.5** Responsive breakpoint switching (768px)
- [ ] **4.6** Smooth transitions (200ms)

**Files created:** `src/components/layout/Sidebar.tsx`, `src/components/layout/TopBar.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/AppLayout.tsx`, `src/hooks/useTheme.ts`

---

## Phase 5: Shared UI Components

- [ ] **5.1** ProgressBar component (green 0-50%, yellow 50-80%, orange 80-100%, red >100%)
- [ ] **5.2** StatCard component (for summary numbers)
- [ ] **5.3** Avatar chips (for person assignments)
- [ ] **5.4** Status badge (active/pending/closed with color indicators)
- [ ] **5.5** Confirmation dialog (for deletes)
- [ ] **5.6** Currency display helper (NPR/USD with exchange rate)

**Files created:** `src/components/ui/*.tsx`, `src/lib/currency.ts`

---

## Phase 6: Budget Page

- [ ] **6.1** BudgetSummaryCards — total budget, total spent, remaining, progress
- [ ] **6.2** BudgetTree — recursive tree rendering with expand/collapse
- [ ] **6.3** BudgetItemRow — displays name, budget, spent, progress, status, assigned people
- [ ] **6.4** Add/Edit budget item form (modal or inline)
  - Leaf nodes: editable budgetAmount, spentAmount, status
  - Parent nodes: auto-calculated amounts (read-only)
- [ ] **6.5** Add child item action
- [ ] **6.6** Delete budget item with cascade confirmation
- [ ] **6.7** Assign/unassign people to leaf items (multi-select)
- [ ] **6.8** Mobile: floating action button for adding items

**Files created:** `src/pages/BudgetPage.tsx`, `src/components/budget/BudgetTree.tsx`, `src/components/budget/BudgetItemRow.tsx`, `src/components/budget/BudgetSummaryCards.tsx`, `src/components/budget/BudgetItemForm.tsx`, `src/components/budget/AssignPeople.tsx`

---

## Phase 7: People Page

- [ ] **7.1** PeopleList — grid/list of all people
- [ ] **7.2** PersonCard — name, assignment count, actions
- [ ] **7.3** Add/Edit person form
- [ ] **7.4** Delete person with cascade confirmation (removes all assignments)

**Files created:** `src/pages/PeoplePage.tsx`, `src/components/people/PeopleList.tsx`, `src/components/people/PersonCard.tsx`, `src/components/people/PersonForm.tsx`

---

## Phase 8: Summary Page

- [ ] **8.1** StatCards — total budget, spent, remaining
- [ ] **8.2** Overall ProgressBar
- [ ] **8.3** CategoryBreakdown — per-root-category budget vs spent
- [ ] **8.4** Status grouping summary (active/pending/closed counts & totals)

**Files created:** `src/pages/SummaryPage.tsx`, `src/components/summary/CategoryBreakdown.tsx`

---

## Phase 9: Settings Page

- [ ] **9.1** Currency selector (NPR / USD)
- [ ] **9.2** Exchange rate input (> 0 validation)
- [ ] **9.3** Save to Firestore + cache locally

**Files created:** `src/pages/SettingsPage.tsx`

---

## Phase 10: Polish & Validation

- [ ] **10.1** Input validation: budgetAmount ≥ 0, spentAmount ≥ 0, exchangeRate > 0
- [ ] **10.2** Overspending visual flag (red at >100%)
- [ ] **10.3** Lazy load non-critical pages (Summary, Settings)
- [ ] **10.4** Memoize tree transformations to prevent unnecessary re-renders
- [ ] **10.5** Cross-browser testing
- [ ] **10.6** Mobile responsiveness QA

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
