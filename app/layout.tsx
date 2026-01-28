import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import {ThemeProvider} from './theme/ThemeProvider'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'chesslog.me',
  description: 'Log your chess games',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
