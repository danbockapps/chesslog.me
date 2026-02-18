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
    <picture>
      <source srcSet="/logo-dark.png" media="(prefers-color-scheme: dark)" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="chesslog.me" height={height} width={width} className={className} />
    </picture>
  )
}
