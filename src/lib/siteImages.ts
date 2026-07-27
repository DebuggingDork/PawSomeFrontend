/**
 * Marketing photography for the landing and auth pages, served from our own R2
 * bucket.
 *
 * These used to be hotlinked Unsplash originals, so every visit blocked on a
 * round trip to someone else's CDN for the largest images on the page — and one
 * of them (the socialising article) had rotted to a 404 and was rendering
 * broken. They are now fetched once at build/seed time, downscaled to the size
 * each one is actually displayed at, and stored under site/ in the bucket.
 *
 * The list is down from eight entries to two. The other six were stock photos
 * standing in for content the landing page did not have: header images for
 * articles nobody wrote, backdrops for "featured pets" who did not exist, and
 * one dog tile plus one cat tile repeated three times each behind invented
 * captions. Those sections now render the real pets from /pets with the photos
 * their owners uploaded, so the only stock imagery left is the two backgrounds
 * that are genuinely doing a background's job.
 *
 * Regenerate with:
 *   cd backend && uv run --with pillow python scripts/upload_site_images.py
 *
 * That script prints this exact object. Keeping every URL in one module means
 * pointing at a different bucket is a single-file change.
 */
const R2_BASE = 'https://pub-2241f255146e4b8ab3347e935732ec62.r2.dev/site'

export const siteImages = {
  /** Landing hero: two dogs looking up at the camera on a paved path, 1535x1025.
   *
   *  Stored as the supplied PNG, byte for byte — not resized, not re-encoded,
   *  not graded. The hero renders it with object-contain and lays its copy out
   *  against the image's own aspect ratio, so the whole photograph is on screen
   *  at every size: both faces, both sets of ears, both noses and the
   *  background. Anything that would recompress or recrop it defeats the point
   *  of storing the original.
   *
   *  Its own key rather than overwriting an earlier hero, since these objects
   *  are served with a one-year immutable cache. */
  heroPets: `${R2_BASE}/final-home-page-image.png`,
  /** Two dogs running at dusk. The Auth background and the landing's closing
   *  band — was `heroDog` until it stopped being a hero. */
  duskRun: `${R2_BASE}/duskRun.jpg`,
} as const
