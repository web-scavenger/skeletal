import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = 'https://web-scavenger.github.io/skeletal'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'skeletal-ui — Skeleton screens, automated',
    template: '%s | skeletal-ui',
  },
  description:
    'CLI + React library that scans your components, crawls your app with Playwright, and auto-generates pixel-perfect .skeleton.tsx files. Zero manual shimmer code.',
  keywords: [
    'skeleton',
    'skeleton screen',
    'loading state',
    'react',
    'next.js',
    'typescript',
    'cli',
    'ux',
    'shimmer',
    'placeholder',
    'react loading skeleton',
  ],
  authors: [{ name: 'skeletal-ui', url: 'https://github.com/web-scavenger/skeletal' }],
  creator: 'skeletal-ui',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'skeletal-ui — Skeleton screens, automated',
    description:
      'CLI + React library that scans your components and auto-generates pixel-perfect skeleton loading states for React and Next.js.',
    siteName: 'skeletal-ui',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'skeletal-ui — Skeleton screens, automated',
    description:
      'CLI + React library that auto-generates pixel-perfect skeleton loading states for React and Next.js.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
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
