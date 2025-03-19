import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { EmailVerification } from "../views/EmailVerification.js"
import {
  createEmailVerificationRequest,
  deleteEmailVerificationRequestCookie,
  deleteUserEmailVerificationRequest,
  getUserEmailVerificationRequestFromRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
} from "../lib/email-verification.js"
import { updateUserEmailAndSetEmailAsVerified } from "../lib/user.js"

export const verifyEmailRouter = new Hono()

// MARK: - GET /verify-email

verifyEmailRouter.get("/verify-email", async (c) => {
  const user = c.get("user")

  if (!user) {
    return c.redirect("/login")
  }

  if (user.emailVerified) {
    return c.redirect("/")
  }

  let verificationRequest = await getUserEmailVerificationRequestFromRequest(c)

  if (
    !verificationRequest ||
    Date.now() >= verificationRequest.expiresAt.getTime()
  ) {
    verificationRequest = await createEmailVerificationRequest(
      user.id,
      user.email,
    )
    await sendVerificationEmail(
      verificationRequest.email,
      verificationRequest.code,
    )
    setEmailVerificationRequestCookie(c, verificationRequest)
  }

  return c.html(<EmailVerification email={verificationRequest.email} />, 200)
})

// MARK: - POST /verify-email/verify

verifyEmailRouter.post(
  "/verify-email/verify",
  zValidator(
    "form",
    z.object({
      code: z
        .string()
        .length(8, { message: "8 桁の確認コードを入力してください" }),
    }),
    (result, c) => {
      const user = c.get("user")

      if (!user) {
        return c.redirect("/login")
      }

      if (!result.success) {
        return c.html(
          <EmailVerification
            email={user.email}
            values={{ code: result.data.code }}
            errors={result.error.flatten().fieldErrors}
          />,
          200,
        )
      }
    },
  ),
  async (c) => {
    const { code } = c.req.valid("form")

    const user = c.get("user")

    if (!user) {
      return c.redirect("/login")
    }

    const verificationRequest =
      await getUserEmailVerificationRequestFromRequest(c)

    if (
      !verificationRequest ||
      Date.now() >= verificationRequest.expiresAt.getTime()
    ) {
      const verificationRequest = await createEmailVerificationRequest(
        user.id,
        user.email,
      )
      await sendVerificationEmail(
        verificationRequest.email,
        verificationRequest.code,
      )
      setEmailVerificationRequestCookie(c, verificationRequest)

      return c.html(
        <EmailVerification
          email={user.email}
          values={{ code }}
          errors={{
            code: [
              "確認コードを発行していないか、有効期限が切れているため、新しい確認コードを送信しました",
            ],
          }}
        />,
        200,
      )
    }

    if (verificationRequest.code !== code) {
      return c.html(
        <EmailVerification
          email={user.email}
          values={{ code }}
          errors={{ code: ["確認コードが正しくありません"] }}
        />,
        200,
      )
    }

    await deleteUserEmailVerificationRequest(verificationRequest.userId)
    await updateUserEmailAndSetEmailAsVerified(
      verificationRequest.userId,
      verificationRequest.email,
    )
    deleteEmailVerificationRequestCookie(c)

    return c.redirect("/")
  },
)

// MARK: - POST /verify-email/resend

verifyEmailRouter.post("/verify-email/resend", async (c) => {
  const user = c.get("user")

  if (!user) {
    return c.redirect("/login")
  }

  if (user.emailVerified) {
    return c.redirect("/")
  }

  const verificationRequest = await createEmailVerificationRequest(
    user.id,
    user.email,
  )
  await sendVerificationEmail(
    verificationRequest.email,
    verificationRequest.code,
  )
  setEmailVerificationRequestCookie(c, verificationRequest)

  return c.redirect("/verify-email")
})
