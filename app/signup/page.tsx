'use client'

import {AuthLayout} from '@/app/ui/AuthLayout'
import {AuthAlert, AuthField, AuthSubmitButton} from '@/app/ui/AuthForm'
import {AuthOptions} from '@/app/ui/AuthOptions'
import React, {useState} from 'react'
import {signup} from './actions'

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
      subheading="Track your chess journey. Analyze your games, identify patterns, and watch your improvement over time."
      formTitle="Create account"
      alternateAction={{
        text: 'Already have an account?',
        linkText: 'Sign in',
        href: '/login',
      }}
    >
      <AuthOptions moreLabel="Other sign-up options" defaultOpen={!!errorMessage}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled}
            placeholder="you@example.com"
          />
          <AuthField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={disabled}
            placeholder="Enter a secure password"
          />
          {errorMessage && <AuthAlert type="error">{errorMessage}</AuthAlert>}
          {status === 'success' && (
            <AuthAlert type="success">Account created! Redirecting...</AuthAlert>
          )}
          <AuthSubmitButton disabled={disabled} loading={status === 'loading'}>
            Create account
          </AuthSubmitButton>
        </form>
      </AuthOptions>
    </AuthLayout>
  )
}

export default SignUpPage
