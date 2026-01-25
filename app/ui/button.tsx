import React from 'react'
import {Spinner} from './spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  fullWidth?: boolean
  variant?: 'filled' | 'outlined'
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  fullWidth = false,
  variant = 'outlined',
  loading = false,
  disabled = false,
  ...props
}) => {
  const variantClasses = variant === 'filled' ? 'btn-glass btn-glass-primary' : 'btn-glass'

  return (
    <button
      className={`inline-flex items-center justify-center ${variantClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
      disabled={disabled || loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

export default Button
