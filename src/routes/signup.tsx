import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { hash } from "@node-rs/argon2"
import { Signup } from "../views/Signup.js"
import { prisma, isPrismaClientKnownRequestError } from "../lib/db.js"
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "../lib/session.js"
import type { Context } from "../lib/context.js"

export const signupRouter = new Hono<Context>()

/**
 * GET /signup
 */
signupRouter.get("/signup", async (c) => {
  const session = c.get("session")

  if (session) {
    return c.redirect("/")
  }

  return c.html(<Signup />, 200)
})

/**
 * POST /signup
 */
signupRouter.post(
  "/signup",
  zValidator(
    "form",
    z
      .object({
        email: z
          .string()
          .email({ message: "有効なメールアドレスを入力してください" }),
        password: z
          .string()
          .min(8, { message: "8 文字以上のパスワードを入力してください" })
          .max(100, { message: "100 文字以内のパスワードを入力してください" }),
        confirmPassword: z
          .string()
          .min(8, { message: "8 文字以上のパスワードを入力してください" })
          .max(100, { message: "100 文字以内のパスワードを入力してください" }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "パスワードが一致しません",
        path: ["confirmPassword"],
      }),
    (result, c) => {
      if (!result.success) {
        return c.html(
          <Signup
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

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      })

      const token = generateSessionToken()
      const session = await createSession(token, user.id)
      setSessionTokenCookie(c, token, session.expiresAt)

      return c.redirect("/")
    } catch (error) {
      const isUniqueConstraintViolation =
        isPrismaClientKnownRequestError(error) && error.code === "P2002"

      if (isUniqueConstraintViolation) {
        return c.html(
          <Signup
            values={{ email }}
            errors={{
              email: ["このメールアドレスはすでに登録されています"],
            }}
          />,
          200,
        )
      }

      return c.html(<Signup values={{ email }} />, 200)
    }
  },
)
