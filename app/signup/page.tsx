'use client'

import React, {useState} from 'react'
import {signup} from './actions'

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const disabled = ['loading', 'success'].includes(status)

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-surface p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-text-primary font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary
                bg-surface text-text-primary"
              placeholder="Enter your email"
              {...{disabled}}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-text-primary font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary
                bg-surface text-text-primary"
              placeholder="Enter your password"
              {...{disabled}}
            />
          </div>
          {errorMessage && <div className="text-error text-sm mb-4">{errorMessage}</div>}
          {status === 'success' && (
            <div className="text-success text-sm mb-4">
              Account created successfully! Redirecting...
            </div>
          )}

          <button
            className="btn w-full"
            type="submit"
            disabled={status === 'success'}
            onClick={async () => {
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
            }}
          >
            {status === 'loading' && <span className="loading loading-spinner"></span>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignUpPage
