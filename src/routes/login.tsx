import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { Login } from "../views/Login.js"
import { prisma } from "../lib/db.js"
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "../lib/session.js"
import { verifyPasswordHash } from "../lib/password.js"

export const loginRouter = new Hono()

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

/**
 * POST /login
 */
loginRouter.post(
  "/login",
  zValidator(
    "form",
    z.object({
      email: z
        .string()
        .email({ message: "有効なメールアドレスを入力してください" }),
      password: z
        .string()
        .min(8, { message: "8 文字以上のパスワードを入力してください" })
        .max(100, { message: "100 文字以内のパスワードを入力してください" }),
    }),
    (result, c) => {
      if (!result.success) {
        return c.html(
          <Login
            values={{ email: result.data.email }}
            errors={result.error.flatten().fieldErrors}
          />,
          200,
        )
      }
    },
  ),
  async (c) => {
    const { email, password } = c.req.valid("form")

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (!existingUser) {
      return c.html(
        <Login
          values={{ email }}
          errors={{
            email: ["メールアドレスまたはパスワードが正しくありません"],
          }}
        />,
        200,
      )
    }

    const validPassword = await verifyPasswordHash(
      existingUser.passwordHash,
      password,
    )

    if (!validPassword) {
      return c.html(
        <Login
          values={{ email }}
          errors={{
            password: ["メールアドレスまたはパスワードが正しくありません"],
          }}
        />,
        200,
      )
    }

    const token = generateSessionToken()
    const session = await createSession(token, existingUser.id)
    setSessionTokenCookie(c, token, session.expiresAt)

    return c.redirect("/")
  },
)
