import { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AvatarChip } from "@/components/ui/avatar-chip"
import { usePeople } from "@/hooks/usePeople"
import { useAssignments } from "@/hooks/useAssignments"
import { useCreateAssignment, useDeleteAssignment } from "@/hooks/useAssignmentMutations"
import type { Person } from "@/types"

type AssignPeopleProps = {
  budgetItemId: string
}

export function AssignPeople({ budgetItemId }: AssignPeopleProps) {
  const [open, setOpen] = useState(false)
  const { data: people = [] } = usePeople()
  const { data: assignments = [] } = useAssignments()
  const createAssignment = useCreateAssignment()
  const deleteAssignment = useDeleteAssignment()

  const itemAssignments = assignments.filter((a) => a.budgetItemId === budgetItemId)
  const assignedPersonIds = new Set(itemAssignments.map((a) => a.personId))
  const assignedPeople = people.filter((p) => assignedPersonIds.has(p.id))
  const unassignedPeople = people.filter((p) => !assignedPersonIds.has(p.id))

  const handleAssign = (person: Person) => {
    createAssignment.mutate({ budgetItemId, personId: person.id })
  }

  const handleUnassign = (personId: string) => {
    const assignment = itemAssignments.find((a) => a.personId === personId)
    if (assignment) deleteAssignment.mutate(assignment.id)
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {assignedPeople.map((person) => (
        <AvatarChip
          key={person.id}
          name={person.name}
          onRemove={() => handleUnassign(person.id)}
        />
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Icon name="person_add" size="sm" />
            </Button>
          }
        />
        <PopoverContent className="w-48 p-2" align="start">
          {unassignedPeople.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2 text-center">
              {people.length === 0 ? "No people added yet" : "All people assigned"}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {unassignedPeople.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors duration-200 text-left"
                  onClick={() => handleAssign(person)}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                  {person.name}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
