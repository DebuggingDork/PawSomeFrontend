import type { LucideIcon } from 'lucide-react'
import { GraduationCap, Mars, Scissors, ShieldCheck, Venus } from 'lucide-react'
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
  Icon: LucideIcon
  label: string
  /** Solid fill for the chip the icon sits in. */
  fillClassName: string
}

/**
 * Pink for female, blue for male, so gender is readable at a glance.
 *
 * This started as a coloured `♀`/`♂` text glyph and was unreadable at card
 * size. Two reasons, and colour alone fixed neither: those codepoints fall back
 * to whatever symbol font the platform happens to have, which draws them
 * hairline-thin and inconsistently across machines; and a thin stroke on a
 * translucent pill over a photo has almost nothing to contrast against.
 *
 * So: a Lucide SVG — stroke weight we control, identical on every platform —
 * knocked out in white on a solid colour chip. The fill is what the eye
 * catches first, which is the whole point; the icon shape and an accessible
 * label still carry the meaning for anyone who cannot separate the hues, so
 * colour is never the only cue.
 */
const GENDER_MARKS: Record<'male' | 'female', GenderMark> = {
  male: { Icon: Mars, label: 'Male', fillClassName: 'bg-sky-500' },
  female: { Icon: Venus, label: 'Female', fillClassName: 'bg-pink-500' },
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
