import {FC} from 'react'
import {login} from './actions'
import {AuthLayout} from '@/app/ui/AuthLayout'

interface Props {
  searchParams: Promise<{error?: '400'}>
}

const LoginPage: FC<Props> = async (props) => {
  const searchParams = await props.searchParams

  return (
    <AuthLayout
      heading={
        <>
          Welcome
          <br />
          <span className="text-primary">back.</span>
        </>
      }
      subheading="Pick up where you left off. Your chess journey awaits."
      formTitle="Sign in"
      alternateAction={{
        text: "Don't have an account?",
        linkText: 'Create one',
        href: '/signup',
      }}
    >
      <form className="space-y-6">
        {searchParams.error === '400' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">Invalid email or password</span>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-base-content/60 text-sm uppercase tracking-widest font-medium"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-base-300 text-base-content text-lg
              placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-base-content/60 text-sm uppercase tracking-widest font-medium"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-base-300 text-base-content text-lg
              placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>

        <button
          formAction={login}
          className="group relative w-full mt-8 py-4 px-6 bg-primary hover:bg-secondary text-primary-content rounded-lg
            overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 font-semibold"
        >
          <span className="inline-flex items-center gap-2">
            Sign in
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
