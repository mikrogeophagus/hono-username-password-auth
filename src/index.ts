import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { csrf } from "hono/csrf"
import { secureHeaders } from "hono/secure-headers"

import { indexRouter } from "./routes/index.js"

const app = new Hono()

app.use(csrf())
app.use(secureHeaders({ referrerPolicy: "strict-origin-when-cross-origin" }))

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
