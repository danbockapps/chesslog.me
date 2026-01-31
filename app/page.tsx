import {getUser} from '@/lib/auth'
import Image from 'next/image'
import {redirect} from 'next/navigation'
import logo from '../public/logo.webp'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await getUser()

  if (user) redirect('/collections')

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-base-100 bg-opacity-90 rounded-lg shadow-lg">
        <Image
          src={logo}
          alt="chesslog.me Logo"
          width={150}
          height={150}
          className="mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold mb-4">Welcome to chesslog.me</h1>
        <p className="text-lg mb-6">Log and analyze your chess games.</p>
        <div className="flex space-x-4 justify-center">
          <a href="/login">
            <button
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition
                duration-300"
            >
              Log In
            </button>
          </a>
          <a href="/signup">
            <button
              className="px-6 py-3 bg-success hover:bg-success/90 text-white font-semibold rounded-lg shadow-md transition
                duration-300"
            >
              Sign Up
            </button>
          </a>
        </div>
      </div>
    </main>
  )
}
