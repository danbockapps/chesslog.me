import {FC} from 'react'
import {login} from './actions'

interface Props {
  searchParams: Promise<{error?: '400'}>
}

const LoginPage: FC<Props> = async (props) => {
  const searchParams = await props.searchParams
  return (
    <div className="flex items-center justify-center min-h-screen">
      <form className="bg-surface p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">
          Welcome to chesslog.me
        </h2>

        {searchParams.error === '400' && (
          <div
            className="bg-error/10 border border-error text-error px-4 py-3 mb-5 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Invalid email or password</strong>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-text-primary font-semibold mb-2">
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary
              bg-surface text-text-primary"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-text-primary font-semibold mb-2">
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary
              bg-surface text-text-primary"
          />
        </div>
        <div className="flex space-x-4">
          <button formAction={login} className="w-full">
            Log in
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginPage
