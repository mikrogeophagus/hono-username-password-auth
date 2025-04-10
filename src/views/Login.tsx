import { Layout } from "./Layout.js"

interface LoginProps {
  values?: {
    email?: string
  }

  errors?: {
    email?: string[]
    password?: string[]
  }
}

export function Login({ values, errors }: LoginProps) {
  return (
    <Layout title="ログイン">
      <h1>ログイン</h1>
      <form action="/login" method="post">
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            name="email"
            id="email"
            value={values?.email}
            autocomplete={"email"}
            required
          />
          {errors?.email?.map((error) => <div>{error}</div>)}
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            name="password"
            id="password"
            autocomplete={"current-password"}
            required
          />
          {errors?.password?.map((error) => <div>{error}</div>)}
        </div>
        <button type="submit">ログイン</button>
      </form>
    </Layout>
  )
}
