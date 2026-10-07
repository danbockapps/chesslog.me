'use client'

import {useId, useState} from 'react'

interface AuthOptionsProps {
  moreLabel: string
  defaultOpen?: boolean
  children: React.ReactNode
}

// Lichess is the default way in. `children` (the email/password form) sits behind a disclosure.
// Plain <a>, not <Link>: this starts an OAuth redirect and must not be prefetched.
export function AuthOptions({moreLabel, defaultOpen = false, children}: AuthOptionsProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div>
      <a
        href="/auth/lichess"
        className="block w-full py-4 px-6 text-center rounded-lg bg-primary hover:bg-secondary
          text-primary-content transition-all duration-300 hover:shadow-xl hover:shadow-primary/20
          font-semibold"
      >
        Continue with Lichess
      </a>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="mt-8 flex w-full items-center justify-center gap-2 cursor-pointer
          text-base-content/50 hover:text-primary transition-colors text-sm"
      >
        {moreLabel}
        <svg
          className={`w-4 h-4 transition-transform duration-300 motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Grid row animates 0fr -> 1fr so the panel grows to its natural height. */}
      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out
          motion-reduce:transition-none ${
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
      >
        <div className="overflow-hidden">
          <div className="pt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
