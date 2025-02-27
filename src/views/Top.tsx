import { Layout } from "./Layout.js"

interface TopProps {
  title: string
}

export function Top({ title }: TopProps) {
  return (
    <Layout title={title}>
      <h1>{title}</h1>
      <p>Welcome to {title}</p>
    </Layout>
  )
}
