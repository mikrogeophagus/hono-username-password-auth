import { serve } from "@hono/node-server"
import { Hono } from "hono"

import { indexRouter } from "./routes/index.js"

const app = new Hono()

app.route("/", indexRouter)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
