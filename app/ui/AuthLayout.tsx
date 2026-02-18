import Link from 'next/link'
import {ChessboardPattern} from './ChessboardPattern'
import {Logo} from './Logo'

interface AuthLayoutProps {
  heading: React.ReactNode
  subheading: string
  formTitle: string
  alternateAction: {
    text: string
    linkText: string
    href: string
  }
  children: React.ReactNode
}

export function AuthLayout({
  heading,
  subheading,
  formTitle,
  alternateAction,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-base-100 text-base-content flex relative overflow-hidden">
      <ChessboardPattern />

      {/* Decorative gradient orbs */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 dark:opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.6 0.118 185) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full opacity-5 dark:opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.777 0.152 182) 0%, transparent 70%)',
        }}
      />

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative animate-fade-in-up">
        <div>
          <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
            <Logo height={64} width={185} className="h-16 w-auto" />
          </Link>
        </div>

        <div className="max-w-md">
          <h1 className="text-5xl xl:text-6xl text-base-content leading-[1.1] mb-6 font-display font-medium">
            {heading}
          </h1>
          <p className="text-xl text-base-content/50 leading-relaxed">{subheading}</p>
        </div>

        <div />
      </div>

      {/* Right side - Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative animate-fade-in-up"
        style={{animationDelay: '0.1s'}}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 text-center">
            <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <Logo height={64} width={185} className="h-16 w-auto" />
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl text-base-content mb-3 font-display font-semibold">
              {formTitle}
            </h2>
            <p className="text-base-content/50">
              {alternateAction.text}{' '}
              <Link
                href={alternateAction.href}
                className="text-primary hover:text-secondary transition-colors underline underline-offset-4
                  decoration-primary/30 hover:decoration-secondary"
              >
                {alternateAction.linkText}
              </Link>
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
