export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`API Error ${status}`)
    this.status = status
    this.body = body
  }
}

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers as any),
  }

  let body: BodyInit | undefined
  if (init && 'json' in init) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify((init as any).json)
  } else {
    body = (init?.body ?? undefined) as any
  }

  const res = await fetch(path.startsWith('http') ? path : `/api${path}`, {
    ...init,
    headers,
    body,
  })

  const text = await res.text()
  const parsed = text ? safeJson(text) : null

  if (!res.ok) throw new ApiError(res.status, parsed)
  return parsed as T
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
