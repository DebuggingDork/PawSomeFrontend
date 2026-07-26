import type { LucideIcon } from 'lucide-react'
import { GraduationCap, Scissors, ShieldCheck } from 'lucide-react'
import type { Pet } from './api/types'

const NEW_HERE_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * A pet reads as "new here" only on its first day.
 *
 * This was two weeks, which meant that any burst of signups — and every seeded
 * account — wore the ribbon at once. A badge that nearly everyone has stops
 * reading as "say hello to this one" and starts reading as decoration, or worse,
 * as padding to make the community look busier than it is. One day keeps it rare
 * enough to mean something.
 *
 * A rolling 24 hours rather than "the same calendar day" on purpose: a pet that
 * joined at 11:50pm should not lose the ribbon ten minutes later.
 */
export function isNewHere(createdAt: string | null | undefined): boolean {
  if (createdAt == null) return false
  const age = Date.now() - new Date(createdAt).getTime()
  // A future timestamp means clock skew, not a brand-new pet.
  return age >= 0 && age < NEW_HERE_WINDOW_MS
}

export interface GenderMark {
  glyph: string
  label: string
  /** Text colour only — these sit on the existing translucent-black pills. */
  className: string
}

/**
 * Pink for female, blue for male, so gender is readable at a glance instead of
 * requiring the viewer to parse a small ♀/♂ glyph. The colour carries the
 * meaning redundantly, never alone: every caller keeps the glyph and its
 * accessible label, so this still works for anyone who cannot pick the hues
 * apart.
 */
const GENDER_MARKS: Record<'male' | 'female', GenderMark> = {
  male: { glyph: '♂', label: 'Male', className: 'text-sky-400' },
  female: { glyph: '♀', label: 'Female', className: 'text-pink-400' },
}

/** Anything that isn't explicitly male reads as female, matching prior behaviour. */
export function genderMark(gender: string | null | undefined): GenderMark {
  return gender === 'male' ? GENDER_MARKS.male : GENDER_MARKS.female
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
