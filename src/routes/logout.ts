import { Hono } from "hono"
import { deleteSessionTokenCookie, invalidateSession } from "../lib/session.js"

export const logoutRouter = new Hono()

// MARK: - POST /logout

logoutRouter.post("/logout", async (c) => {
  const session = c.get("session")

  if (!session) {
    return c.redirect("/")
  }

  await invalidateSession(session.id)
  deleteSessionTokenCookie(c)

  return c.redirect("/")
})
