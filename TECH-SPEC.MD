# Wedding Budget Planner – Technical Specification

## 1. Overview

The Wedding Budget Planner is a responsive web application that enables users to manage wedding finances through hierarchical budgeting, person assignments, and real-time financial tracking.

Designs and UI references for this application are defined in a separate `design.md` file. All UI implementation should strictly follow the layouts, components, and visual guidelines specified in that file.

The system supports nested budget categories, multi-user assignment, and dynamic financial summaries using Firebase Firestore as the backend.

---

## 2. Architecture

### Frontend

* React 18 (SPA)
* Vite (bundler)
* Tailwind CSS (utility-first styling)
* shadcn/ui + Radix UI (component primitives)
* React Router DOM v6 (routing)
* TanStack React Query v5 (server state management)

### Backend

* Firebase Firestore (NoSQL database)
* Firebase SDK (client-side integration)

### State Management

* Server state: React Query
* UI state: React local state + context where needed
* Persistent UI preferences: localStorage

---

## 3. Core Data Models

### 3.1 BudgetItem

```ts
type BudgetItem = {
  id: string
  name: string
  budgetAmount: number
  spentAmount: number
  parentId: string | null
  status: 'active' | 'pending' | 'closed'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3.2 Person

```ts
type Person = {
  id: string
  name: string
  createdAt: timestamp
}
```

### 3.3 Assignment (Join Table)

```ts
type Assignment = {
  id: string
  budgetItemId: string
  personId: string
}
```

### 3.4 Settings

```ts
type Settings = {
  currency: 'NPR' | 'USD'
  exchangeRate: number
}
```

---

## 4. Firestore Structure

```
/budgetItems/{id}
/people/{id}
/assignments/{id}
/settings/global
```

### Notes:

* No deep nesting in Firestore (flat collections)
* Relationships handled via IDs
* Use composite queries for filtering where needed

---

## 5. Key Features & Logic

### 5.1 Hierarchical Budget System

* Budget items support unlimited nesting via `parentId`
* Tree structure is built client-side
* Recursive aggregation:

  * `totalBudget = sum(all children)`
  * `totalSpent = sum(all children)`

### 5.2 Cascading Delete

When deleting a budget item:

1. Recursively find all child items
2. Delete:

   * All descendant budget items
   * Related assignments

### 5.3 Assignment Logic

* Many-to-many relationship via `assignments`
* Deleting a person:

  * Remove all related assignments
* UI shows assigned users as avatar chips

### 5.4 Financial Calculations

* Total Budget = sum of root + nested items
* Total Spent = sum of all spent amounts
* Remaining = Budget - Spent
* Progress = Spent / Budget

### 5.5 Status Handling

* `active` → default
* `pending` → payment pending
* `closed` → completed

Used for:

* Filtering
* Color indicators
  n- Summary grouping

---

## 6. Pages & Responsibilities

### 6.1 Budget Page

Responsibilities:

* Display hierarchical tree
* CRUD operations on budget items
* Assign people to items
* Show summary cards

Key Components:

* BudgetTree
* BudgetItemRow
* BudgetSummaryCards

---

### 6.2 People Page

Responsibilities:

* CRUD operations for people
* Display assignment counts

Key Components:

* PeopleList
* PersonCard

---

### 6.3 Summary Page

Responsibilities:

* Aggregate financial data
* Display analytics

Key Components:

* StatCards
* ProgressBar
* CategoryBreakdown

---

### 6.4 Settings Page

Responsibilities:

* Manage currency
* Store exchange rate

Persistence:

* Firestore (primary)
* Cached locally

---

## 7. UI/UX System

### Layout

* Desktop:

  * Sidebar (collapsible, persisted in localStorage)
* Mobile:

  * Bottom navigation
  * Floating action buttons

### Theming

* Light/Dark mode (stored in localStorage)
* Tailwind dark mode class strategy

---

## 8. Data Fetching Strategy

Using React Query:

* Queries:

  * `budgetItems`
  * `people`
  * `assignments`
  * `settings`

* Mutations:

  * create/update/delete for all entities

* Realtime Sync:

  * Firestore listeners → update React Query cache

---

## 9. Performance Considerations

* Memoized tree transformations
* Batched Firestore reads where possible
* Avoid deep re-renders in tree components
* Lazy load non-critical pages

---

## 10. Validation & Constraints

* budgetAmount ≥ 0
* spentAmount ≥ 0
* spentAmount ≤ budgetAmount (soft validation)
* exchangeRate > 0

---

## 11. Non-Functional Requirements

* Fully responsive (mobile-first)
* Cross-browser compatibility
* Real-time updates via Firestore
* Accessible UI components (Radix primitives)

---

## 12. Future Enhancements

* Authentication (Firebase Auth)
* Multi-user collaboration
* Export (CSV/PDF)

---

## 13. Development Workflow

### Scripts

```bash
npm run dev
npm run build
npm run preview
```

### Environment Variables

* Firebase config via `.env`

---

## 14. Design System

See [DESIGN-SPEC.MD](DESIGN-SPEC.MD) for the authoritative color palette, typography, and spacing tokens.

---

End of Technical Specification

