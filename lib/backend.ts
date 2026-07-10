import { cookies } from "next/headers"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"

export const SESSION_COOKIE = "el_session"
export const ROLE_COOKIE = "el_role"

export class BackendError extends Error {
  status: number
  body: any

  constructor(status: number, body: any) {
    super(body?.error || "Request failed")
    this.status = status
    this.body = body
  }
}

/**
 * Server-only proxy to the Express backend. Attaches the JWT from the httpOnly
 * session cookie (never exposed to client JS) unless auth is explicitly disabled.
 */
export async function backendFetch(path: string, init: RequestInit = {}, options: { auth?: boolean } = {}) {
  const { auth = true } = options
  const headers = new Headers(init.headers)

  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })

  const isJson = res.headers.get("content-type")?.includes("application/json")
  const body = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new BackendError(res.status, body)
  }

  return body
}
