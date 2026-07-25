import type { LucideIcon } from 'lucide-react'
import { GraduationCap, Scissors, ShieldCheck } from 'lucide-react'
import type { Pet } from './api/types'

const NEW_HERE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

/** A pet reads as "new here" for its first two weeks on PawSome. */
export function isNewHere(createdAt: string | null | undefined): boolean {
  return createdAt != null && Date.now() - new Date(createdAt).getTime() < NEW_HERE_WINDOW_MS
}

export interface HealthTag {
  key: 'is_vaccinated' | 'is_neutered' | 'is_trained'
  label: string
  icon: LucideIcon
  className: string
}

const HEALTH_TAGS: HealthTag[] = [
  {
    key: 'is_vaccinated',
    label: 'Vaccinated',
    icon: ShieldCheck,
    className: 'border-emerald-800 bg-emerald-950/60 text-emerald-400',
  },
  {
    key: 'is_neutered',
    label: 'Neutered',
    icon: Scissors,
    className: 'border-sky-800 bg-sky-950/60 text-sky-400',
  },
  {
    key: 'is_trained',
    label: 'Trained',
    icon: GraduationCap,
    className: 'border-violet-800 bg-violet-950/60 text-violet-400',
  },
]

/** The subset of a pet's health badges that are actually true, in display order. */
export function activeHealthTags(pet: Pick<Pet, 'is_vaccinated' | 'is_neutered' | 'is_trained'>): HealthTag[] {
  return HEALTH_TAGS.filter((tag) => pet[tag.key])
}
