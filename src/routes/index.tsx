import { Hono } from "hono"
import { Top } from "../views/Top.js"

export const indexRouter = new Hono()

indexRouter.get("/", (c) => {
  return c.html(<Top title="Hono" />)
})
