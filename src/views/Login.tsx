import { Layout } from "./Layout.js"

export function Login() {
  return (
    <Layout title="ログイン">
      <h1>ログイン</h1>
      <form action="/login" method="post">
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input type="password" name="password" id="password" required />
        </div>
        <button type="submit">ログイン</button>
      </form>
    </Layout>
  )
}
