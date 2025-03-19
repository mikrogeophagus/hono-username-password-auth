import { Layout } from "./Layout.js"

interface TopProps {
  title: string

  user?: {
    id: number
    email: string
    emailVerified: boolean
  }
}

export function Top({ title, user }: TopProps) {
  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <p>Welcome to {title}</p>

      {user ? (
        <>
          <ul>
            <li>ユーザ ID: {user.id}</li>
            <li>
              メールアドレス: {user.email}
              {user.emailVerified && (
                <span
                  style={{ margin: "0 0.5em" }}
                  title="このメールアドレスは認証されています"
                >
                  &#x2705;
                </span>
              )}
            </li>
          </ul>
          <form action="/logout" method="post">
            <button type="submit">ログアウト</button>
          </form>
        </>
      ) : (
        <nav>
          <ul>
            <li>
              <a href="/login">ログイン</a>
            </li>
            <li>
              <a href="/signup">サインアップ</a>
            </li>
          </ul>
        </nav>
      )}
    </Layout>
  )
}
