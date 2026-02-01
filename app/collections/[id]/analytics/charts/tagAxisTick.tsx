'use client'

import TagBadge from '@/app/ui/tagBadge'

interface TagAxisTickProps {
  x?: number
  y?: number
  payload?: {value: string}
  isPublic?: boolean
  isMobile?: boolean
}

export default function TagAxisTick({
  x = 0,
  y = 0,
  payload,
  isPublic = false,
  isMobile = false,
}: TagAxisTickProps) {
  const name = payload?.value || ''

  // Responsive badge sizing
  const badgeWidth = isMobile ? 120 : 140
  const badgeX = isMobile ? -125 : -145

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={badgeX} y={-12} width={badgeWidth} height={24}>
        <div className="flex justify-end">
          <TagBadge
            name={name}
            isPublic={isPublic}
            className="text-xs"
            maxWidth={`${badgeWidth}px`}
          />
        </div>
      </foreignObject>
    </g>
  )
}
