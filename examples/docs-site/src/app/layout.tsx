import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'skeletal — Skeleton screens, automated',
  description:
    'CLI + React library that scans your components and auto-generates pixel-perfect skeleton loading states for React and Next.js.',
  keywords: ['skeleton', 'loading', 'react', 'nextjs', 'cli'],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  )
}
