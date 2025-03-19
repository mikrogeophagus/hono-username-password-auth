import { createMiddleware } from "hono/factory"
import { getCookie } from "hono/cookie"
import { prisma } from "../lib/db.js"
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
  invalidateSession,
} from "../lib/session.js"

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const token = getCookie(c, "session")

  if (!token) {
    c.set("session", null)
    c.set("user", null)
    return await next()
  }

  const session = await validateSessionToken(token)

  if (!session) {
    deleteSessionTokenCookie(c)
    c.set("session", null)
    c.set("user", null)
    return await next()
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    await invalidateSession(session.id)
    deleteSessionTokenCookie(c)
    c.set("session", null)
    c.set("user", null)
    return await next()
  }

  setSessionTokenCookie(c, token, session.expiresAt)
  c.set("session", session)
  c.set("user", user)
  await next()
})
