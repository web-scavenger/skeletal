import type { ReactNode } from 'react'

export const metadata = {
  title: 'skeletal — example app',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '24px' }}>
        <nav style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
        </nav>
        {children}
      </body>
    </html>
  )
}
