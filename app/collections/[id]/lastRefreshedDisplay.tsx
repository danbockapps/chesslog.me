'use client' // because otherwise date.toLocaleString() causes a hydration error due to a mismatch in redering between server and client
import {captionClassNames} from '@/app/ui/SectionHeader'
import {FC} from 'react'

interface Props {
  lastRefreshed: Date | null
}

const LastRefreshedDisplay: FC<Props> = ({lastRefreshed}) => (
  <p className={`${captionClassNames} ml-auto mr-4`}>
    Last refreshed: {lastRefreshed?.toLocaleString() ?? 'Never'}
  </p>
)

export default LastRefreshedDisplay
