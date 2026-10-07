interface AuthOptionsProps {
  moreLabel: string
  defaultOpen?: boolean
  children: React.ReactNode
}

// Lichess is the default way in. `children` (the email/password form) sits behind a disclosure.
// Plain <a>, not <Link>: this starts an OAuth redirect and must not be prefetched.
export function AuthOptions({moreLabel, defaultOpen = false, children}: AuthOptionsProps) {
  return (
    <div className="space-y-8">
      <a
        href="/auth/lichess"
        className="block w-full py-4 px-6 text-center rounded-lg bg-primary hover:bg-secondary
          text-primary-content transition-all duration-300 hover:shadow-xl hover:shadow-primary/20
          font-semibold"
      >
        Continue with Lichess
      </a>

      <details open={defaultOpen} className="group">
        <summary
          className="flex items-center justify-center gap-2 cursor-pointer list-none
            text-base-content/50 hover:text-primary transition-colors text-sm select-none
            [&::-webkit-details-marker]:hidden"
        >
          {moreLabel}
          <svg
            className="w-4 h-4 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-8">{children}</div>
      </details>
    </div>
  )
}
