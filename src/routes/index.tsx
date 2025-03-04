import { Hono } from "hono"
import { Top } from "../views/Top.js"
import type { Context } from "../lib/context.js"

export const indexRouter = new Hono<Context>()

indexRouter.get("/", (c) => {
  const user = c.get("user")
  return c.html(<Top title="Hono" user={user ?? undefined} />)
})
