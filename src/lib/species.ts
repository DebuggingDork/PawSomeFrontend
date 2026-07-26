/** Glyph per species, shared so the community dialog and the onboarding card
 * preview can't drift. Falls back to a paw for anything unrecognised, which the
 * old inline `species === 'dog' ? 'dog' : 'cat'` ternaries could not do: they
 * labelled rabbits, birds and "other" as cats. */
const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  rabbit: '🐇',
  bird: '🦜',
  other: '🐾',
}

export function speciesEmoji(species: string | null | undefined): string {
  return SPECIES_EMOJI[(species ?? '').toLowerCase()] ?? '🐾'
}

export function speciesLabel(species: string | null | undefined): string {
  const key = (species ?? '').toLowerCase()
  return key ? key[0].toUpperCase() + key.slice(1) : 'Pet'
}
