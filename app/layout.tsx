import type {Metadata} from 'next'
import {DM_Sans, Cormorant_Garamond} from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'chesslog.me',
  description: 'Log your chess games',
  // Use a gray icon in dev so the tab is easy to tell apart from production
  icons: {
    icon: process.env.NODE_ENV === 'development' ? '/icon-dev.svg' : '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${cormorant.variable} font-sans`}>{children}</body>
    </html>
  )
}
