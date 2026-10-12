import {ChessboardPattern} from '@/app/ui/ChessboardPattern'
import {Logo} from '@/app/ui/Logo'
import analyticsScreenshot from '@/public/screenshots/analytics.png'
import gameViewScreenshot from '@/public/screenshots/game-view.png'
import {getUser} from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import {redirect} from 'next/navigation'

export const dynamic = 'force-dynamic'

function ChessPiece({piece, className = ''}: {piece: string; className?: string}) {
  const pieces: Record<string, string> = {
    king: '\u2654',
    queen: '\u2655',
    rook: '\u2656',
    bishop: '\u2657',
    knight: '\u2658',
    pawn: '\u2659',
  }
  return <span className={`font-normal ${className}`}>{pieces[piece]}</span>
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: string
}) {
  return (
    <div
      className="group relative bg-base-100 border border-base-300 rounded-xl p-6
        hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500
        animate-fade-in-up"
      style={{animationDelay: delay}}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0
          group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
      />
      <div className="relative">
        <div className="text-3xl mb-4 text-primary">{icon}</div>
        <h3 className="text-lg font-semibold text-base-content mb-2">{title}</h3>
        <p className="text-base-content/70 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function StatBlock({value, label, delay}: {value: string; label: string; delay: string}) {
  return (
    <div className="text-center animate-fade-in-up" style={{animationDelay: delay}}>
      <div className="text-4xl md:text-5xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-base-content/60 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  delay,
}: {
  quote: string
  author: string
  role: string
  delay: string
}) {
  return (
    <div
      className="bg-base-200/50 border border-base-300 rounded-xl p-6 animate-fade-in-up"
      style={{animationDelay: delay}}
    >
      <blockquote className="text-base-content/80 italic mb-4 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <ChessPiece piece="knight" className="text-lg text-primary" />
        </div>
        <div>
          <div className="font-medium text-base-content text-sm">{author}</div>
          <div className="text-xs text-base-content/60">{role}</div>
        </div>
      </div>
    </div>
  )
}

export default async function Home() {
  const user = await getUser()

  if (user) redirect('/collections')

  return (
    <main className="min-h-screen bg-base-100 text-base-content relative overflow-hidden">
      <ChessboardPattern />

      {/* Navigation */}
      <nav
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4
          sm:py-6 animate-fade-in"
      >
        <Logo height={80} width={233} className="h-11 sm:h-14 md:h-20 w-auto shrink-0" />
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            href="/login"
            className="text-sm text-base-content/70 hover:text-base-content transition-colors
              whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-primary hover:bg-secondary text-primary-content px-3 sm:px-4 py-2
              rounded-lg transition-colors font-medium whitespace-nowrap"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6
                animate-fade-in-up font-display"
              style={{animationDelay: '0.1s'}}
            >
              Your chess games tell a&nbsp;story.
              <br />
              <span className="text-primary">Learn to read it.</span>
            </h1>
            <p
              className="text-lg md:text-xl text-base-content/70 max-w-2xl mb-8 leading-relaxed
                animate-fade-in-up"
              style={{animationDelay: '0.2s'}}
            >
              Other apps analyze your games. This one helps you analyze{' '}
              <em className="text-base-content">yourself</em>. Capture the biggest lesson from each
              game and discover the patterns your memory hides from you.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
              style={{animationDelay: '0.3s'}}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary
                  hover:bg-secondary text-primary-content px-6 py-3 rounded-lg transition-all
                  font-medium text-lg hover:shadow-lg hover:shadow-primary/20"
              >
                Start for free
                <span className="text-xl">&rarr;</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-base-300
                  hover:border-primary/50 px-6 py-3 rounded-lg transition-all font-medium
                  text-base-content/80 hover:text-base-content"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-base-200/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                Your brain is lying to you about your chess.
              </h2>
              <p className="text-base-content/70 leading-relaxed mb-4">
                We all have confirmation bias. We remember the brilliant tactic we found but forget
                the five games where we didn&apos;t know the middlegame plan. We think we lose to
                tricky tactics when really we&apos;re blundering in time pressure.
              </p>
              <p className="text-base-content/70 leading-relaxed">
                <strong className="text-base-content">
                  Other apps can tell you your win rate in the Sicilian.
                </strong>{' '}
                They can&apos;t tell you <em>why</em> you keep losing those games, or which of your
                weaknesses would be easiest for <em>you</em> to fix. Only you know what&apos;s
                happening inside your head. chesslog.me helps you capture it.
              </p>
            </div>
            <div
              className="bg-base-100 border border-base-300 rounded-xl p-6 animate-fade-in-up"
              style={{animationDelay: '0.2s'}}
            >
              <div
                className="text-sm font-medium text-base-content/60 uppercase tracking-wider mb-4"
              >
                What you might discover about yourself
              </div>
              <ul className="space-y-3">
                {[
                  'You keep playing on when you should take a break',
                  "You rush opening moves you haven't actually studied",
                  "You avoid endgames you'd win if you just tried",
                  'Your "tactical weakness" is actually a focus problem',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base-content/80">
                    <span className="text-primary mt-1">
                      <ChessPiece piece="pawn" className="text-sm" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up font-display"
              style={{animationDelay: '0.1s'}}
            >
              Simple process, powerful insights
            </h2>
            <p
              className="text-base-content/70 max-w-2xl mx-auto animate-fade-in-up"
              style={{animationDelay: '0.15s'}}
            >
              Import from Chess.com, Lichess, or add your OTB games. Build your personal improvement
              database.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ChessPiece piece="rook" />}
              title="Add your games"
              description="Sync your Chess.com or Lichess account automatically, or add OTB tournament games. All your chess in one place."
              delay="0.2s"
            />
            <FeatureCard
              icon={<ChessPiece piece="bishop" />}
              title="Capture the lesson"
              description="After each game, write down the biggest takeaways. Tag common patterns: time trouble, missed tactic, opening gap. Build your personal improvement map."
              delay="0.3s"
            />
            <FeatureCard
              icon={<ChessPiece piece="queen" />}
              title="Discover patterns"
              description="See charts of your tagged games over time. Find out what's really causing your losses and focus your training."
              delay="0.4s"
            />
          </div>
        </div>
      </section>

      {/* Product Screenshots */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-base-200/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up font-display"
              style={{animationDelay: '0.1s'}}
            >
              See it in action
            </h2>
            <p
              className="text-base-content/70 max-w-2xl mx-auto animate-fade-in-up"
              style={{animationDelay: '0.15s'}}
            >
              A clean, focused interface that makes reflection effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Screenshot 1: Game view with notes */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div
                className="aspect-[4/3] bg-base-100 border border-base-300 rounded-xl
                  overflow-hidden shadow-lg"
              >
                <Image
                  src={gameViewScreenshot}
                  alt="Reviewing a game with tags and notes in chesslog.me"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <p className="text-center text-base-content/70 mt-4 text-sm">
                Review your game and capture the key lesson
              </p>
            </div>

            {/* Screenshot 2: Analytics view */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div
                className="aspect-[4/3] bg-base-100 border border-base-300 rounded-xl
                  overflow-hidden shadow-lg"
              >
                <Image
                  src={analyticsScreenshot}
                  alt="Analytics view showing tag distribution and themes in notes"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <p className="text-center text-base-content/70 mt-4 text-sm">
                See your patterns emerge over time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introspection Section */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-base-200/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
              You&apos;ve read the books.
              <br />
              <span className="text-primary">Now what?</span>
            </h2>
            <p className="text-base-content/70 leading-relaxed max-w-2xl mx-auto mb-4">
              Chess books and courses are great. But after you&apos;ve consumed enough content,
              there&apos;s little improvement left from consuming more. The next level requires
              something different: <strong className="text-base-content">introspection</strong>.
            </p>
            <p className="text-base-content/70 leading-relaxed max-w-2xl mx-auto">
              What were you actually thinking when you made that mistake? What pattern in your own
              mind led to that blunder? Most improving players know introspection matters, but
              don&apos;t know how to do it. chesslog.me gives you a simple system.
            </p>
          </div>
        </div>
      </section>

      {/* For Coaches */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              className="order-2 md:order-1 bg-base-200/50 border border-base-300 rounded-xl p-6
                animate-fade-in-up"
              style={{animationDelay: '0.2s'}}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex
                    items-center justify-center"
                >
                  <span className="text-white text-sm font-bold">ST</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Student&apos;s Game vs. opponent</div>
                  <div className="text-xs text-base-content/60">Tagged: Missed tactic</div>
                </div>
              </div>
              <div className="bg-base-100 rounded-lg p-4 mb-4 border border-base-300">
                <div className="text-xs font-medium text-base-content/60 mb-1">
                  Student&apos;s takeaway
                </div>
                <div className="text-sm text-base-content/80 italic">
                  &ldquo;I need to do more tactics puzzles. I keep missing wins.&rdquo;
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="text-xs font-medium text-secondary dark:text-primary mb-1">
                  Coach&apos;s comment
                </div>
                <div className="text-sm text-base-content/80">
                  Look closer&mdash;you saw the tactic but talked yourself out of it. This is the
                  3rd game where you rejected a winning move because it &ldquo;looked too
                  easy.&rdquo; Trust your calculation!
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div
                className="inline-block text-xs font-medium text-primary uppercase tracking-wider
                  mb-4"
              >
                For coaches
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                Correct your students&apos; misconceptions
              </h2>
              <p className="text-base-content/70 leading-relaxed mb-4">
                Students often draw the wrong conclusions from their games (and engine analysis can
                make this even worse). They blame tactics when it&apos;s really time management.
                They think they need more theory when they actually need to trust their instincts.
              </p>
              <p className="text-base-content/70 leading-relaxed">
                With chesslog.me, you see exactly what your students <em>think</em> went wrong. Now
                you can guide them to the real lesson&mdash;the one that will actually help them
                improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials  - uncomment when we have actual testimonials */}
      {/*}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-base-200/30">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in-up"
            style={{animationDelay: '0.1s'}}
          >
            Players are seeing results
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <TestimonialCard
              quote="I kept blaming tactics, but writing down my thoughts after each game revealed the real issue: I play on tilt after losing. That's fixable. Tactics training wasn't going to help."
              author="Marcus R."
              role="1800 Chess.com Rapid"
              delay="0.2s"
            />
            <TestimonialCard
              quote="My students finally understand that improvement isn't about more puzzles. When they see their own patterns in black and white, they get motivated to actually change."
              author="Elena K."
              role="FIDE Trainer"
              delay="0.3s"
            />
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="relative z-10 px-6 md:px-12 py-24 bg-base-200/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in-up font-display"
            style={{animationDelay: '0.1s'}}
          >
            Ready to see what your games
            <br />
            <span className="text-primary">are really telling you?</span>
          </h2>
          <p
            className="text-lg text-base-content/70 mb-8 animate-fade-in-up"
            style={{animationDelay: '0.2s'}}
          >
            Stop guessing at your weaknesses. Start seeing them clearly.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-secondary
              text-primary-content px-8 py-4 rounded-lg transition-all font-medium text-lg
              hover:shadow-lg hover:shadow-primary/20 animate-fade-in-up"
            style={{animationDelay: '0.3s'}}
          >
            Create your free account
            <span className="text-xl">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-base-300">
        <div
          className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <Logo height={56} width={163} className="h-14 w-auto opacity-60" />
          <div className="text-sm text-base-content/50">
            Built for chess players who want to actually improve.
          </div>
        </div>
      </footer>
    </main>
  )
}
