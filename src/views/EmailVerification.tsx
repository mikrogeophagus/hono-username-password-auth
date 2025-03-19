import { Layout } from "./Layout.js"

interface EmailVerificationProps {
  email: string

  values?: {
    code?: string
  }

  errors?: {
    code?: string[]
  }
}

export function EmailVerification({
  email,
  values,
  errors,
}: EmailVerificationProps) {
  return (
    <Layout title="メールアドレス認証">
      <h1>メールアドレス認証</h1>
      <p>{email} に確認コードを送信しました</p>
      <form action="/verify-email/verify" method="post">
        <div>
          <label htmlFor="code">確認コード</label>
          <input
            type="text"
            name="code"
            id="code"
            value={values?.code}
            required
          />
          {errors?.code?.map((error) => <div>{error}</div>)}
        </div>
        <button type="submit">認証</button>
      </form>
      <form action="/verify-email/resend" method="post">
        <button type="submit">再送</button>
      </form>
    </Layout>
  )
}
