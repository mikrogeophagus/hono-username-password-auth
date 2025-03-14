import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { csrf } from "hono/csrf"
import { secureHeaders } from "hono/secure-headers"

import { sessionMiddleware } from "./middleware/session.js"

import { indexRouter } from "./routes/index.js"
import { loginRouter } from "./routes/login.js"
import { signupRouter } from "./routes/signup.js"
import { logoutRouter } from "./routes/logout.js"

const app = new Hono()

// MARK: Middleware

app.use(csrf())
app.use(secureHeaders({ referrerPolicy: "strict-origin-when-cross-origin" }))

app.use(sessionMiddleware)

// MARK: Routes

app.route("/", indexRouter)
app.route("/", loginRouter)
app.route("/", signupRouter)
app.route("/", logoutRouter)

// MARK: Server

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
