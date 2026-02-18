import {getUser} from '@/lib/auth'
import Link from 'next/link'
import {Logo} from '@/app/ui/Logo'
import {AppContextProvider} from './context'
import MainMenu from './mainMenu'

export default async function Layout({children}: Readonly<{children: React.ReactNode}>) {
  const user = await getUser()

  return (
    <AppContextProvider initialValue={user}>
      <div className="navbar bg-base-200 border-b border-base-200">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost px-2">
            <Logo height={44} width={128} className="h-11 w-auto" />
          </Link>
        </div>

        <div className="flex-none">
          <MainMenu />
        </div>
      </div>

      <div className="min-h-screen bg-base-200">{children}</div>
    </AppContextProvider>
  )
}
