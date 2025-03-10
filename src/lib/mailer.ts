import nodemailer, { type SendMailOptions } from "nodemailer"
import { env } from "../env.js"

const isDev = env.NODE_ENV === "development"

const transporter = nodemailer.createTransport({
  secure: true,
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT,
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
  debug: isDev,
  logger: isDev,
})

export async function sendEmail(
  options: Omit<SendMailOptions, "from" | "sender" | "replyTo" | "inReplyTo">,
): Promise<void> {
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    ...options,
  })

  console.log("Email sent:", info.response)
}
