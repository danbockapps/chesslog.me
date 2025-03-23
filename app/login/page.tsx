import {FC} from 'react'
import Button from '../ui/button'
import {login} from './actions'

const LoginPage: FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-yellow-50 to-gray-100">
    <form className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome to chesslog.me</h2>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2
            focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
          Password:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2
            focus:ring-blue-500"
        />
      </div>
      <div className="flex space-x-4">
        <Button formAction={login} className="w-full">
          Log in
        </Button>
      </div>
    </form>
  </div>
)

export default LoginPage
