import { createMiddleware } from "hono/factory"
import { getCookie } from "hono/cookie"
import { prisma } from "../lib/db.js"
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from "../lib/session.js"

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const token = getCookie(c, "session")

  if (!token) {
    c.set("session", null)
    c.set("user", null)
    return await next()
  }

  const session = await validateSessionToken(token)

  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    c.set("session", session)
    c.set("user", user)
    setSessionTokenCookie(c, token, session.expiresAt)
  } else {
    c.set("session", null)
    c.set("user", null)
    deleteSessionTokenCookie(c)
  }

  await next()
})
