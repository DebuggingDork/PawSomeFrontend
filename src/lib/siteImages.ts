/**
 * Marketing imagery for the landing and auth pages, served from our own R2
 * bucket.
 *
 * These used to be hotlinked Unsplash originals, so every visit blocked on a
 * round trip to someone else's CDN for the largest images on the page — and one
 * of them (the socialising article) had rotted to a 404 and was rendering
 * broken. They are now fetched once at build/seed time, downscaled to the size
 * each one is actually displayed at, and stored under site/ in the bucket.
 *
 * Regenerate with:
 *   cd backend && uv run --with pillow python scripts/upload_site_images.py
 *
 * That script prints this exact object. Keeping every URL in one module means
 * pointing at a different bucket is a single-file change.
 */
const R2_BASE = 'https://pub-2241f255146e4b8ab3347e935732ec62.r2.dev/site'

export const siteImages = {
  heroDog: `${R2_BASE}/heroDog.jpg`,
  articleVaccination: `${R2_BASE}/articleVaccination.jpg`,
  articleSocialising: `${R2_BASE}/articleSocialising.jpg`,
  articleNutrition: `${R2_BASE}/articleNutrition.jpg`,
  featuredDog: `${R2_BASE}/featuredDog.jpg`,
  featuredCat: `${R2_BASE}/featuredCat.jpg`,
  toggleDog: `${R2_BASE}/toggleDog.jpg`,
  toggleCat: `${R2_BASE}/toggleCat.jpg`,
} as const
