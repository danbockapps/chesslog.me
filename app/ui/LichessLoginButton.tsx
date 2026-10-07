// Plain <a>, not <Link>: this starts an OAuth redirect and must not be prefetched.
export function LichessLoginButton() {
  return (
    <div className="mt-8 space-y-6">
      <div
        className="flex items-center gap-4 text-base-content/40 text-sm uppercase tracking-widest"
      >
        <div className="flex-1 border-t border-base-300" />
        or
        <div className="flex-1 border-t border-base-300" />
      </div>
      <a
        href="/auth/lichess"
        className="block w-full py-4 px-6 text-center rounded-lg border-2 border-base-300
          text-base-content hover:border-primary hover:text-primary transition-colors font-semibold"
      >
        Continue with Lichess
      </a>
    </div>
  )
}
