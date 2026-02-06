export function ChessboardPattern() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rotate-12 opacity-[0.03] dark:opacity-[0.05]">
        <div className="grid grid-cols-8 w-full h-full">
          {Array.from({length: 64}).map((_, i) => (
            <div
              key={i}
              className={`aspect-square ${(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 'bg-primary' : 'bg-transparent'}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] -rotate-12 opacity-[0.03] dark:opacity-[0.05]">
        <div className="grid grid-cols-8 w-full h-full">
          {Array.from({length: 64}).map((_, i) => (
            <div
              key={i}
              className={`aspect-square ${(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 'bg-primary' : 'bg-transparent'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
