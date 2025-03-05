import { Layout } from "./Layout.js"

interface SignupProps {
  values?: {
    email?: string
    password?: string
    confirmPassword?: string
  }

  errors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
}

export function Signup({ values, errors }: SignupProps) {
  return (
    <Layout title="サインアップ">
      <h1>サインアップ</h1>
      <form action="/signup" method="post">
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
            value={values?.password}
            autocomplete={"new-password"}
            required
          />
          {errors?.password?.map((error) => <div>{error}</div>)}
        </div>
        <div>
          <label htmlFor="confirmPassword">パスワード確認</label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={values?.confirmPassword}
            autocomplete={"new-password"}
            required
          />
          {errors?.confirmPassword?.map((error) => <div>{error}</div>)}
        </div>
        <button type="submit">サインアップ</button>
      </form>
    </Layout>
  )
}
