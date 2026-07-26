/**
 * How long someone has been on PawSome, phrased the way you'd say it out loud
 * rather than as a date nobody asked for.
 *
 * Counts whole days from the account's creation, in local time, so "today" means
 * the calendar day the user is actually looking at rather than a 24-hour window
 * measured from whatever time they happened to sign up.
 */
export function daysSince(isoDate: string): number {
  const start = new Date(isoDate)
  if (Number.isNaN(start.getTime())) return 0

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.floor((startOfDay(new Date()) - startOfDay(start)) / 86_400_000)
  // A clock skew between the server and the browser can put creation slightly in
  // the future; "-1 days together" would be a strange thing to greet someone with.
  return Math.max(0, days)
}

/** The line shown under the profile name. Deliberately counts days rather than
 * switching to months and years: the number climbing is the whole point, and
 * "2 months" reads like a subscription notice. */
export function membershipLine(isoDate: string): string {
  const days = daysSince(isoDate)
  if (days === 0) return 'Joined today. Welcome aboard.'
  if (days === 1) return 'Together 1 day'
  return `Together ${days.toLocaleString()} days`
}
