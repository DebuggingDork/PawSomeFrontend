/**
 * Where a signed-in user belongs when they haven't asked for anywhere in
 * particular.
 *
 * Shared between AuthPage's post-login navigate and the guard on /auth. Those two
 * redirects race each other (the auth store publishes through
 * useSyncExternalStore, which re-renders subscribers synchronously, so the guard
 * can fire before AuthPage's next line runs), and they used to disagree: one said
 * Discover, the other said "/". Pointing both at one constant makes the outcome
 * the same whichever wins.
 *
 * Lives in lib/ rather than App.tsx because App imports the pages, so a page
 * importing it back from App would close an import cycle.
 */
export const POST_LOGIN_ROUTE = '/discover'
