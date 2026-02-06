'use client'

import React, {useState} from 'react'
import {signup} from './actions'
import {AuthLayout} from '@/app/ui/AuthLayout'

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const disabled = ['loading', 'success'].includes(status)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setStatus('loading')
    try {
      await signup(email, password)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('An unknown error occurred')
      }
    }
  }

  return (
    <AuthLayout
      heading={
        <>
          Every game
          <br />
          <span className="text-primary">tells a story.</span>
        </>
      }
      subheading="Track your chess journey. Annotate your brilliancies. Learn from your blunders."
      formTitle="Create account"
      alternateAction={{
        text: 'Already have an account?',
        linkText: 'Sign in',
        href: '/login',
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled}
            placeholder="you@example.com"
            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-base-300 text-base-content text-lg
              placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={disabled}
            placeholder="Enter a secure password"
            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-base-300 text-base-content text-lg
              placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>

        {errorMessage && (
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
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-success/10 border border-success/20 text-success">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm">Account created! Redirecting...</span>
          </div>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="group relative w-full mt-8 py-4 px-6 bg-primary hover:bg-secondary text-primary-content rounded-lg
            overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none font-semibold"
        >
          <span
            className={`inline-flex items-center gap-2 transition-all duration-300 ${
              status === 'loading' ? 'opacity-0' : 'opacity-100' }`}
          >
            Create account
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
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary-content/30 border-t-primary-content rounded-full animate-spin" />
            </div>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-base-content/30 text-sm leading-relaxed">
        By creating an account, you agree to our{' '}
        <a
          href="#"
          className="text-base-content/50 hover:text-base-content/70 underline underline-offset-2"
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          href="#"
          className="text-base-content/50 hover:text-base-content/70 underline underline-offset-2"
        >
          Privacy Policy
        </a>
      </p>
    </AuthLayout>
  )
}

export default SignUpPage
