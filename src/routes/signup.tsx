import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { Signup } from "../views/Signup.js"
import { prisma, isPrismaClientKnownRequestError } from "../lib/db.js"
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "../lib/session.js"
/*
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
} from "../lib/email-verification.js"
*/
import { hashPassword } from "../lib/password.js"

export const signupRouter = new Hono()

// MARK: - GET /signup

signupRouter.get("/signup", async (c) => {
  const session = c.get("session")

  if (session) {
    return c.redirect("/")
  }

  return c.html(<Signup />, 200)
})

// MARK: - POST /signup

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

    const passwordHash = await hashPassword(password)

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      })

      /*
      const emailVerificationRequest = await createEmailVerificationRequest(
        user.id,
        user.email,
      )
      await sendVerificationEmail(
        emailVerificationRequest.email,
        emailVerificationRequest.code,
      )
      setEmailVerificationRequestCookie(c, emailVerificationRequest)
      */

      const token = generateSessionToken()
      const session = await createSession(token, user.id)
      setSessionTokenCookie(c, token, session.expiresAt)

      return c.redirect("/verify-email")
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
