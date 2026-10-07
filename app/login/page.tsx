import {FC} from 'react'
import {login} from './actions'
import {AuthLayout} from '@/app/ui/AuthLayout'
import {AuthAlert, AuthField, AuthSubmitButton} from '@/app/ui/AuthForm'
import {AuthOptions} from '@/app/ui/AuthOptions'

type LoginError = '400' | 'lichess' | 'lichess-no-email'

const ERROR_MESSAGES: Record<LoginError, string> = {
  '400': 'Invalid email or password',
  lichess: 'Lichess login failed. Please try again.',
  'lichess-no-email':
    'Lichess did not share a confirmed email address. Confirm an email on Lichess, or sign up with email and password.',
}

interface Props {
  searchParams: Promise<{error?: string}>
}

const LoginPage: FC<Props> = async (props) => {
  const searchParams = await props.searchParams
  const errorMessage = ERROR_MESSAGES[searchParams.error as LoginError]

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
      {errorMessage && (
        <AuthAlert type="error" className="mb-6">
          {errorMessage}
        </AuthAlert>
      )}
      <AuthOptions moreLabel="Other login options" defaultOpen={!!errorMessage}>
        <form className="space-y-6">
          <AuthField label="Email" name="email" type="email" placeholder="you@example.com" />
          <AuthField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
          />
          <AuthSubmitButton formAction={login}>Sign in</AuthSubmitButton>
        </form>
      </AuthOptions>
    </AuthLayout>
  )
}

export default LoginPage
