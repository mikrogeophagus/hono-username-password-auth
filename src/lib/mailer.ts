import nodemailer, { type SendMailOptions } from "nodemailer"
import { env } from "../env.js"

// TODO: メールサーバを設定する

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GOOGLE_EMAIL,
    pass: env.GOOGLE_APP_PASSWORD,
  },
})

export async function sendEmail(
  options: Omit<SendMailOptions, "from" | "sender" | "replyTo" | "inReplyTo">,
): Promise<void> {
  const info = await transporter.sendMail({
    from: env.GOOGLE_EMAIL,
    ...options,
  })

  console.log("Email sent:", info.response)
}
