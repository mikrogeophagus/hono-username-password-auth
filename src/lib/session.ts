import type { Context } from "hono"
import { env } from "hono/adapter"
import { setCookie, deleteCookie } from "hono/cookie"
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { valkey } from "./valkey.js"

const TOKEN_BYTE_LENGTH = 20
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30
const SESSION_RENEWAL_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15

export interface Session {
  id: string
  userId: number
  expiresAt: Date
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTE_LENGTH)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  }

  await valkey.set(
    `session:${session.id}`,
    JSON.stringify({
      id: session.id,
      user_id: session.userId,
      expires_at: Math.floor(session.expiresAt.getTime() / 1000),
    }),
    "EXAT",
    Math.floor(session.expiresAt.getTime() / 1000),
  )

  return session
}

export async function validateSessionToken(
  token: string,
): Promise<Session | null> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const item = await valkey.get(`session:${sessionId}`)

  if (item === null) {
    return null
  }

  const result = JSON.parse(item)
  const session: Session = {
    id: result.id,
    userId: result.user_id,
    expiresAt: new Date(result.expires_at * 1000),
  }

  // セッションの有効期限が切れている場合は削除する
  if (Date.now() >= session.expiresAt.getTime()) {
    await valkey.del(`session:${sessionId}`)
    return null
  }

  // セッションの有効期限が近い場合は延長する
  if (
    Date.now() >=
    session.expiresAt.getTime() - SESSION_RENEWAL_THRESHOLD_MS
  ) {
    session.expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

    await valkey.set(
      `session:${session.id}`,
      JSON.stringify({
        id: session.id,
        user_id: session.userId,
        expires_at: Math.floor(session.expiresAt.getTime() / 1000),
      }),
      "EXAT",
      Math.floor(session.expiresAt.getTime() / 1000),
    )
  }

  return session
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await valkey.del(`session:${sessionId}`)
}

export function setSessionTokenCookie(
  c: Context,
  token: string,
  expiresAt: Date,
): void {
  const { NODE_ENV } = env<{ NODE_ENV: string }>(c, "node")

  if (NODE_ENV === "production") {
    setCookie(c, "session", token, {
      httpOnly: true,
      sameSite: "Lax",
      expires: expiresAt,
      path: "/",
      secure: true,
    })
  } else {
    setCookie(c, "session", token, {
      httpOnly: true,
      sameSite: "Lax",
      expires: expiresAt,
      path: "/",
    })
  }
}

export function deleteSessionTokenCookie(c: Context): void {
  const { NODE_ENV } = env<{ NODE_ENV: string }>(c, "node")

  if (NODE_ENV === "production") {
    deleteCookie(c, "session", {
      path: "/",
      secure: true,
    })
  } else {
    deleteCookie(c, "session", {
      path: "/",
    })
  }
}
