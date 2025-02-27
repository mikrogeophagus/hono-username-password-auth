import type { PropsWithChildren } from "hono/jsx"

interface LayoutProps {
  title: string
}

export function Layout({ title, children }: PropsWithChildren<LayoutProps>) {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
