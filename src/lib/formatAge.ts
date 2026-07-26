/** Compact age for cards and chips: "8mo", "3y", "2y 4mo". */
export function formatAge(months: number): string {
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (years === 0) return `${months}mo`
  if (remMonths === 0) return `${years}y`
  return `${years}y ${remMonths}mo`
}

/** Spelled-out age for the one place it's the headline value rather than metadata
 * (the onboarding age slider), where "2y 4mo" reads like a serial number. */
export function formatAgeLong(months: number): string {
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  if (remMonths > 0 || years === 0) parts.push(`${remMonths} ${remMonths === 1 ? 'month' : 'months'}`)
  return parts.join(', ')
}
