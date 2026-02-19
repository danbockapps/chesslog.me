export function Logo({
  height,
  width,
  className = '',
}: {
  height: number
  width: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 1400 275"
      height={height}
      width={width}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="chesslog.me"
      role="img"
    >
      <style>{`
        .logo-text {
          font-family: var(--font-sans), 'DM Sans', sans-serif;
          font-size: 155px;
          font-weight: 700;
          fill: oklch(0.511 0.096 186);
        }
        @media (prefers-color-scheme: dark) {
          .logo-text { fill: white; }
        }
      `}</style>
      <image
        href="/logo-icon.png"
        x="0"
        y="-48"
        width="344"
        height="371"
        preserveAspectRatio="xMidYMid meet"
      />
      <text x="370" y="175" className="logo-text">
        chesslog.me
      </text>
    </svg>
  )
}
