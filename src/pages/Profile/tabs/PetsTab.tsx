import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, PawPrint } from 'lucide-react'
import { createPet, deletePet, listMyPets, updatePet } from '@/lib/api/pets'
import { PetForm } from '@/components/profile/PetForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Pet, PetCreateInput } from '@/lib/api/types'

const MAX_PETS = 5

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; pet: Pet }

export function PetsTab() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const petsQuery = useQuery({ queryKey: ['pets', 'me'], queryFn: listMyPets })

  const invalidatePets = () => queryClient.invalidateQueries({ queryKey: ['pets', 'me'] })

  const createMutation = useMutation({
    mutationFn: createPet,
    onSuccess: () => {
      invalidatePets()
      setMode({ kind: 'list' })
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PetCreateInput }) => updatePet(id, body),
    onSuccess: () => {
      invalidatePets()
      setMode({ kind: 'list' })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deletePet,
    onSuccess: () => {
      invalidatePets()
      setConfirmDeleteId(null)
    },
  })

  const pets = petsQuery.data ?? []

  if (mode.kind === 'create') {
    return (
      <PetForm
        submitLabel="Create pet"
        submitting={createMutation.isPending}
        onCancel={() => setMode({ kind: 'list' })}
        onSubmit={(values) => createMutation.mutate(values)}
      />
    )
  }

  if (mode.kind === 'edit') {
    return (
      <PetForm
        initial={mode.pet}
        submitLabel="Save changes"
        submitting={updateMutation.isPending}
        onCancel={() => setMode({ kind: 'list' })}
        onSubmit={(values) => updateMutation.mutate({ id: mode.pet.id, body: values })}
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">{pets.length} / {MAX_PETS} pets</p>
        <button
          onClick={() => setMode({ kind: 'create' })}
          disabled={pets.length >= MAX_PETS}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b35]/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add pet
        </button>
      </div>

      {petsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {!petsQuery.isLoading && pets.length === 0 && (
        <EmptyState
          icon={PawPrint}
          title="No pets yet"
          description="Add your first pet to start discovering matches."
        />
      )}

      <ul className="space-y-3">
        {pets.map((pet) => (
          <li
            key={pet.id}
            className="flex items-center gap-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 transition-colors hover:border-neutral-700"
          >
            {pet.primary_photo_url ? (
              <img src={pet.primary_photo_url} alt={pet.name} className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800">
                <PawPrint className="h-6 w-6 text-neutral-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-white">{pet.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    pet.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {pet.is_active ? 'Active' : 'Needs a photo'}
                </span>
              </div>
              <p className="truncate text-xs text-neutral-500">
                {pet.breed} · {pet.gender} · {pet.age_months}mo
              </p>
            </div>
            <button
              onClick={() => setMode({ kind: 'edit', pet })}
              aria-label={`Edit ${pet.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {confirmDeleteId === pet.id ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => deleteMutation.mutate(pet.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(pet.id)}
                aria-label={`Delete ${pet.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
