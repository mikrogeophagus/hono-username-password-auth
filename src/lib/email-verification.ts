import type { Context } from "hono"
import { env } from "hono/adapter"
import { getCookie, setCookie, deleteCookie } from "hono/cookie"
import { encodeBase32 } from "@oslojs/encoding"
import { generateRandomOTP } from "./utils.js"
import { sendEmail } from "./mailer.js"
import { prisma } from "./db.js"
import type { EmailVerificationRequest } from "@prisma/client"
export type { EmailVerificationRequest }

export async function getUserEmailVerificationRequest(
  userId: number,
  id: string,
): Promise<EmailVerificationRequest | null> {
  const request = await prisma.emailVerificationRequest.findFirst({
    where: { id, userId },
  })

  return request
}

export async function createEmailVerificationRequest(
  userId: number,
  email: string,
): Promise<EmailVerificationRequest> {
  deleteUserEmailVerificationRequest(userId)

  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const id = encodeBase32(bytes).toLowerCase()
  const code = generateRandomOTP()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10)

  const request = await prisma.emailVerificationRequest.create({
    data: { id, userId, email, code, expiresAt },
  })

  return request
}

export async function deleteUserEmailVerificationRequest(
  userId: number,
): Promise<void> {
  await prisma.emailVerificationRequest.deleteMany({ where: { userId } })
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "メール認証",
    text: `あなたの確認コードは ${code} です`,
  })
}

export function setEmailVerificationRequestCookie(
  c: Context,
  request: EmailVerificationRequest,
): void {
  const { NODE_ENV } = env<{ NODE_ENV: string }>(c, "node")
  const isProd = NODE_ENV === "production"

  setCookie(c, "email_verification", request.id, {
    httpOnly: true,
    sameSite: "Lax",
    expires: request.expiresAt,
    path: "/",
    secure: isProd,
  })
}

export function deleteEmailVerificationRequestCookie(c: Context): void {
  const { NODE_ENV } = env<{ NODE_ENV: string }>(c, "node")
  const isProd = NODE_ENV === "production"

  deleteCookie(c, "email_verification", {
    path: "/",
    secure: isProd,
  })
}

export async function getUserEmailVerificationRequestFromRequest(
  c: Context,
): Promise<EmailVerificationRequest | null> {
  const user = c.get("user")
  if (!user) return null

  const id = getCookie(c, "email_verification")
  if (!id) return null

  const request = await getUserEmailVerificationRequest(user.id, id)
  if (!request) deleteEmailVerificationRequestCookie(c)

  return request
}
