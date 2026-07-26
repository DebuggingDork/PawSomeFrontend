export const SUPPORT_EMAIL = 'pawsome.breeding@gmail.com'

/**
 * A Gmail compose URL rather than a `mailto:` link.
 *
 * `mailto:` hands the click to the operating system, which on a desktop with no
 * mail client configured throws up a "how do you want to open this?" dialog and,
 * often enough, nothing happens at all. This opens Gmail's web composer with the
 * recipient already filled in.
 *
 * The trade: someone who does not use Gmail gets sent to a Gmail login screen.
 * That is why every link built from this still shows the address as its text, so
 * it can be copied by anyone who would rather use their own client.
 */
export function supportComposeUrl(subject?: string, body?: string): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: SUPPORT_EMAIL })
  if (subject) params.set('su', subject)
  if (body) params.set('body', body)
  return `https://mail.google.com/mail/?${params.toString()}`
}
