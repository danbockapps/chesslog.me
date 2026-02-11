import {requireAuth} from '@/lib/auth'
import Link from 'next/link'
import {AppContextProvider} from './context'
import MainMenu from './mainMenu'

export default async function Layout({children}: Readonly<{children: React.ReactNode}>) {
  const user = await requireAuth()

  return (
    <AppContextProvider initialValue={user}>
      <div className="navbar bg-base-100 border-b border-base-200 mb-6">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            chesslog.me
          </Link>
        </div>

        <div className="flex-none">
          <MainMenu />
        </div>
      </div>

      <div className="min-h-screen">{children}</div>
    </AppContextProvider>
  )
}
