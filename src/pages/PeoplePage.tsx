import { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/ui/section-heading"
import { QuoteBlock } from "@/components/ui/quote-block"
import { PersonCard } from "@/components/people/PersonCard"
import { PersonForm } from "@/components/people/PersonForm"
import { usePeople } from "@/hooks/usePeople"
import { useAssignments } from "@/hooks/useAssignments"
import {
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
} from "@/hooks/usePeopleMutations"
import type { Person } from "@/types"

export default function PeoplePage() {
  const { data: people = [], isLoading } = usePeople()
  const { data: assignments = [] } = useAssignments()

  const createMutation = useCreatePerson()
  const updateMutation = useUpdatePerson()
  const deleteMutation = useDeletePerson()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  const handleAdd = () => {
    setEditingPerson(null)
    setFormOpen(true)
  }

  const handleEdit = (person: Person) => {
    setEditingPerson(person)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleSubmit = (name: string) => {
    if (editingPerson) {
      updateMutation.mutate(
        { id: editingPerson.id, data: { name } },
        { onSuccess: () => setFormOpen(false) },
      )
    } else {
      createMutation.mutate(
        { name },
        { onSuccess: () => setFormOpen(false) },
      )
    }
  }

  const getAssignmentCount = (personId: string) =>
    assignments.filter((a) => a.personId === personId).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading people...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading title="The Circle" subtitle="People behind your celebration" />
        <Button onClick={handleAdd} className="hidden md:inline-flex shrink-0">
          <Icon name="person_add" size="md" />
          <span className="ml-1">Add Person</span>
        </Button>
      </div>

      {people.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low p-8 md:p-12 text-center">
          <p className="font-heading text-lg text-muted-foreground italic">
            Every great celebration starts with great people.
          </p>
          <Button onClick={handleAdd} className="mt-4">
            <Icon name="person_add" size="md" />
            <span className="ml-1">Add First Person</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              name={person.name}
              assignmentCount={getAssignmentCount(person.id)}
              onEdit={() => handleEdit(person)}
              onDelete={() => handleDelete(person.id)}
              deleteLoading={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      <QuoteBlock
        quote="Alone we can do so little; together we can do so much."
        attribution="Helen Keller"
      />

      {/* Mobile FAB */}
      <Button
        onClick={handleAdd}
        size="icon"
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-[0_20px_40px_rgba(128,82,83,0.06)] z-40"
      >
        <Icon name="person_add" size="xl" />
      </Button>

      <PersonForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        person={editingPerson}
      />
    </div>
  )
}
