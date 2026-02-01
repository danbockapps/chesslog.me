'use client'

import {useRouter, useSearchParams} from 'next/navigation'

export default function TabNavigation({collectionId}: {collectionId: string}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'games'

  const handleTabChange = (newView: 'games' | 'analytics') => {
    const params = new URLSearchParams(searchParams.toString())
    if (newView === 'analytics') {
      params.set('view', 'analytics')
    } else {
      params.delete('view')
    }
    router.push(`/collections/${collectionId}?${params.toString()}`)
  }

  return (
    <div className="tabs tabs-boxed mb-4">
      <button
        className={`tab ${view === 'games' ? 'tab-active' : ''}`}
        onClick={() => handleTabChange('games')}
      >
        Games
      </button>
      <button
        className={`tab ${view === 'analytics' ? 'tab-active' : ''}`}
        onClick={() => handleTabChange('analytics')}
      >
        Analytics
      </button>
    </div>
  )
}
