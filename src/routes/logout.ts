import { Hono } from "hono"
import { deleteSessionTokenCookie, invalidateSession } from "../lib/session.js"
import type { Context } from "../lib/context.js"

export const logoutRouter = new Hono<Context>()

/**
 * POST /logout
 */
logoutRouter.post("/logout", async (c) => {
  const session = c.get("session")

  if (!session) {
    return c.redirect("/")
  }

  await invalidateSession(session.id)
  deleteSessionTokenCookie(c)

  return c.redirect("/")
})
