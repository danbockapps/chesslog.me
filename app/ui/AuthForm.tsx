import {ComponentProps} from 'react'

const ALERT_STYLES = {
  error: {
    classes: 'bg-error/10 border-error/20 text-error',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  success: {
    classes: 'bg-success/10 border-success/20 text-success',
    icon: 'M5 13l4 4L19 7',
  },
}

interface AuthAlertProps {
  type: keyof typeof ALERT_STYLES
  children: React.ReactNode
  className?: string
}

export function AuthAlert({type, children, className = ''}: AuthAlertProps) {
  const {classes, icon} = ALERT_STYLES[type]
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${classes} ${className}`}>
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      <span className="text-sm">{children}</span>
    </div>
  )
}

interface AuthFieldProps extends ComponentProps<'input'> {
  label: string
  name: string
}

export function AuthField({label, name, ...inputProps}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-base-content/60 text-sm uppercase tracking-widest font-medium"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-base-300
          text-base-content text-lg placeholder:text-base-content/30 focus:outline-none
          focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        required
        {...inputProps}
      />
    </div>
  )
}

interface AuthSubmitButtonProps extends Omit<ComponentProps<'button'>, 'className' | 'type'> {
  loading?: boolean
}

export function AuthSubmitButton({
  loading = false,
  children,
  ...buttonProps
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      className="group relative w-full mt-8 py-4 px-6 bg-primary hover:bg-secondary
        text-primary-content rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl
        hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:shadow-none font-semibold"
      {...buttonProps}
    >
      <span
        className={`inline-flex items-center gap-2 transition-all duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
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
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-5 h-5 border-2 border-primary-content/30 border-t-primary-content
              rounded-full animate-spin"
          />
        </div>
      )}
    </button>
  )
}
