import { Hono } from "hono"
import { Top } from "../views/Top.js"

export const indexRouter = new Hono()

indexRouter.get("/", (c) => {
  const user = c.get("user")
  return c.html(<Top title="Hono" user={user ?? undefined} />)
})
