/**
 * Marketing video for the landing page, served from our own R2 bucket.
 *
 * Uploaded directly (not through the image seeder — this is video, not a
 * photo pipeline). Keeping the URL in one module means pointing at a
 * different bucket or re-uploaded file is a single-file change, same
 * reasoning as siteImages.ts.
 */
export const siteVideos = {
  /** Screen recording walking through the product: profile, discover, match, chat. */
  productDemo: 'https://pub-2241f255146e4b8ab3347e935732ec62.r2.dev/videos/video_pawsome.mp4',
} as const
