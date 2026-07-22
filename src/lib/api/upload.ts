export type UploadableContentType = 'image/jpeg' | 'image/png' | 'image/webp'

/** PUTs a file directly to a presigned R2 URL. The API server never sees the bytes. */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: UploadableContentType,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  })

  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`)
  }
}

export function contentTypeOf(file: File): UploadableContentType | null {
  if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
    return file.type
  }
  return null
}
