import {requireAuth} from '@/lib/auth'
import {AppContextProvider} from './context'
import MainMenu from './mainMenu'

export default async function Layout({children}: Readonly<{children: React.ReactNode}>) {
  const user = await requireAuth()

  return (
    <AppContextProvider initialValue={user}>
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-950 text-white h-16 pl-4">
        <h1 className="text-xl font-bold">chesslog.me</h1>
        <MainMenu />
      </div>

      <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-gray-100">{children}</div>
    </AppContextProvider>
  )
}
