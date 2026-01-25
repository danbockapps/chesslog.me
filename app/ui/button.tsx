import MuiButton, {ButtonProps as MuiButtonProps} from '@mui/material/Button'
import React from 'react'

interface ButtonProps extends MuiButtonProps {
  children: React.ReactNode
  fullWidth?: boolean
  variant?: 'text' | 'outlined' | 'contained'
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  fullWidth = false,
  variant = 'outlined',
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <MuiButton variant={variant} fullWidth={fullWidth} disabled={disabled || loading} {...props}>
      {children}
    </MuiButton>
  )
}

export default Button
