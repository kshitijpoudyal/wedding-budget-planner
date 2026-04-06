import { useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/ui/section-heading"
import { BudgetCategoryCard } from "./BudgetCategoryCard"
import { BudgetToolbar } from "./BudgetToolbar"
import { BulkActionBar } from "./BulkActionBar"
import { sortNodes } from "./sortNodes"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"
import type { BudgetItem } from "@/types"

type BudgetCategoryListProps = {
  tree: BudgetTreeNode[]
  onEdit: (node: BudgetTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  deleteLoading: boolean
  onAddRoot: () => void
  onBulkStatusChange: (ids: string[], status: BudgetItem["status"]) => void
  bulkUpdateLoading?: boolean
}

// Helper to collect all item IDs from tree nodes recursively
function collectAllIds(nodes: BudgetTreeNode[]): string[] {
  const ids: string[] = []
  function traverse(node: BudgetTreeNode) {
    ids.push(node.item.id)
    node.children.forEach(traverse)
  }
  nodes.forEach(traverse)
  return ids
}

// Helper to filter tree nodes by search query (matches name, notes, vendorName)
function filterTree(nodes: BudgetTreeNode[], query: string, statusFilter: string): BudgetTreeNode[] {
  const lowerQuery = query.toLowerCase().trim()

  function matchesQuery(node: BudgetTreeNode): boolean {
    const { item } = node
    // Status filter check
    if (statusFilter !== "all" && item.status !== statusFilter) return false
    // Search check (if no query, all pass)
    if (!lowerQuery) return true
    if (item.name.toLowerCase().includes(lowerQuery)) return true
    if (item.notes?.toLowerCase().includes(lowerQuery)) return true
    if (item.vendorName?.toLowerCase().includes(lowerQuery)) return true
    return false
  }

  function filterNode(node: BudgetTreeNode): BudgetTreeNode | null {
    const filteredChildren = node.children
      .map((child) => filterNode(child))
      .filter((child): child is BudgetTreeNode => child !== null)

    // Include node if it matches or has matching children
    if (matchesQuery(node) || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      }
    }
    return null
  }

  return nodes
    .map((node) => filterNode(node))
    .filter((node): node is BudgetTreeNode => node !== null)
}

export function BudgetCategoryList({
  tree,
  onEdit,
  onAddChild,
  onDelete,
  deleteLoading,
  onAddRoot,
  onBulkStatusChange,
  bulkUpdateLoading,
}: BudgetCategoryListProps) {
  const [sort, setSort] = useState("budget-desc")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  const filteredTree = useMemo(
    () => filterTree(tree, search, statusFilter),
    [tree, search, statusFilter]
  )
  const sortedTree = useMemo(() => sortNodes(filteredTree, sort), [filteredTree, sort])
  const allIds = useMemo(() => collectAllIds(filteredTree), [filteredTree])

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkStatusChange = (status: BudgetItem["status"]) => {
    onBulkStatusChange(Array.from(selectedIds), status)
    clearSelection()
  }

  const selectAll = () => {
    setSelectedIds(new Set(allIds))
  }

  return (
    <section className="space-y-4">
      <SectionHeading title="The Curation" subtitle="Financial narratives for your celebration" />

      <BudgetToolbar
        search={search}
        onSearchChange={setSearch}
        sortValue={sort}
        onSortChange={setSort}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectionMode={selectionMode}
        onSelectionModeChange={setSelectionMode}
        selectedCount={selectedIds.size}
        totalCount={allIds.length}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onAdd={onAddRoot}
        hasItems={tree.length > 0}
      />

      {sortedTree.length === 0 && tree.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low glass-surface p-8 md:p-12 text-center">
          <p className="text-lg text-muted-foreground italic">
            Your celebration awaits its first chapter.
          </p>
          <Button onClick={onAddRoot} className="mt-4">
            <Icon name="add" size="md" />
            <span className="ml-1">Add First Category</span>
          </Button>
        </div>
      ) : sortedTree.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low glass-surface p-8 md:p-12 text-center">
          <Icon name="search_off" size="lg" className="text-muted-foreground mx-auto mb-2" />
          <p className="text-lg text-muted-foreground italic">
            No items match your filters
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setStatusFilter("all")
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTree.map((node) => (
            <BudgetCategoryCard
              key={node.item.id}
              node={node}
              sort={sort}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
            />
          ))}
        </div>
      )}

      <BulkActionBar
        selectedCount={selectedIds.size}
        onStatusChange={handleBulkStatusChange}
        onClearSelection={clearSelection}
        loading={bulkUpdateLoading}
      />
    </section>
  )
}
