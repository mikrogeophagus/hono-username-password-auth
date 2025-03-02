import { Hono } from "hono"
import { Login } from "../views/Login.js"
import type { Context } from "../lib/context.js"

export const loginRouter = new Hono<Context>()

/**
 * GET /login
 */
loginRouter.get("/login", async (c) => {
  const session = c.get("session")

  if (session) {
    return c.redirect("/")
  }

  return c.html(<Login />, 200)
})
