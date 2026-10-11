export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'bad_request',
  ) {
    super(message)
  }
}

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export function assertSameOrigin(request: Request) {
  const site = request.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'none') throw new HttpError(403, 'Cross-site request rejected.')
  const origin = request.headers.get('origin')
  if (!origin) return
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    if (new URL(origin).host === host) return
  } catch {}
  throw new HttpError(403, 'Cross-site request rejected.')
}

export async function readJson(request: Request, maxBytes = 32_000): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new HttpError(415, 'Send JSON.')
  }
  const text = await request.text()
  if (!text || new TextEncoder().encode(text).byteLength > maxBytes)
    throw new HttpError(413, 'Request is empty or too large.')
  try {
    return JSON.parse(text)
  } catch {
    throw new HttpError(400, 'Request is not valid JSON.')
  }
}

const windows = new Map<string, { count: number; resetAt: number }>()

/** Fixed-window, per-instance rate limit. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const time = Date.now()
  const current = windows.get(key)
  if (!current || current.resetAt <= time) {
    windows.set(key, { count: 1, resetAt: time + windowMs })
    if (windows.size > 10_000) for (const [k, w] of windows) if (w.resetAt <= time) windows.delete(k)
    return
  }
  if (++current.count > limit)
    throw new HttpError(429, 'Too many requests. Try again in a few minutes.', 'rate_limited')
}

export const resetRateLimits = () => windows.clear()

export const clientAddress = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local'
