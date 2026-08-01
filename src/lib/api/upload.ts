export type UploadableContentType = 'image/jpeg' | 'image/png' | 'image/webp'

/**
 * The browser never managed to send the request at all.
 *
 * Worth its own type because it is the one failure a retry cannot help with
 * and a different route can. `fetch` rejects with an opaque TypeError for the
 * whole class — offline, DNS, and, the case that matters here, a CORS
 * preflight the bucket refused. R2 matches allowed origins exactly, with no
 * wildcards and no subdomains, so a device on an origin that was not
 * explicitly listed (a phone on the LAN, a preview deployment) is blocked
 * before a single byte leaves it, and there is no status code to report.
 *
 * Callers treat this as "go through the API instead".
 */
export class UploadTransportError extends Error {
  constructor(cause?: unknown) {
    super('Could not reach photo storage from this browser')
    this.name = 'UploadTransportError'
    this.cause = cause
  }
}

/** R2 answered, and said no. */
export class UploadRejectedError extends Error {
  status: number

  constructor(status: number) {
    super(`Photo storage rejected the upload (${status})`)
    this.name = 'UploadRejectedError'
    this.status = status
  }
}

/** PUTs a file directly to a presigned R2 URL. The API server never sees the bytes. */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: UploadableContentType,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    })
  } catch (err) {
    throw new UploadTransportError(err)
  }

  if (!res.ok) {
    throw new UploadRejectedError(res.status)
  }
}

export function contentTypeOf(file: File): UploadableContentType | null {
  if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
    return file.type
  }
  return null
}
