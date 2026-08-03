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
 * The list is down from eight entries to three. Six of the originals were stock
 * photos standing in for content the landing page did not have: header images
 * for articles nobody wrote, backdrops for "featured pets" who did not exist,
 * and one dog tile plus one cat tile repeated three times each behind invented
 * captions. Those sections now render the real pets from /pets with the photos
 * their owners uploaded, so every entry left is a background genuinely doing a
 * background's job rather than standing in for content.
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
   *  not graded. The hero paints it full-bleed with object-cover across the
   *  first viewport so the photograph is the entire stage. */
  heroPets: `${R2_BASE}/final-home-page-image.png`,
  /** Two dogs running at dusk. The landing's closing band — was `heroDog`
   *  until it stopped being a hero, and the Auth background until the cats took
   *  that slot. Still referenced, so leave the object in place. */
  duskRun: `${R2_BASE}/duskRun.jpg`,
  /** Auth background: two cats on a garden ledge behind bougainvillea (Prasad
   *  Bhalerao, Unsplash). Uploaded with a gamma lift (see the seeder) because
   *  Auth's two scrims are tuned for duskRun's low-key dusk light and were left
   *  untouched — the extra brightness has to come out of the file instead.
   *
   *  Briefly `nappingCats` earlier the same day; that object is still in the
   *  bucket, unreferenced. The key carries a version because the objects here
   *  are served with no Cache-Control: there is no TTL to wait out, but a
   *  browser that already has the file has no reason to re-ask either, so a
   *  rewrite behind an unchanged URL is invisible to exactly the people most
   *  likely to look. Bump the suffix rather than overwriting. */
  porchCats: `${R2_BASE}/porchCats-v2.jpg`,
  /** Poster frame for the product-demo video player, cropped from the demo
   *  recording itself at the moment it pans across How It Works. */
  videoDemoThumbnail: `${R2_BASE}/video-demo-thumbnail.jpg`,
} as const
