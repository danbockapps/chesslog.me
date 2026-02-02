'use client'

import {useRouter, useSearchParams} from 'next/navigation'

export default function AnalyticsModalWrapper({
  collectionId,
  children,
}: {
  collectionId: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get('analytics') === 'open'

  const close = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('analytics')
    router.push(`/collections/${collectionId}?${params.toString()}`)
  }

  if (!isOpen) return null

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <button
          className="btn btn-sm btn-circle btn-ghost sticky float-right right-2 top-2 z-10"
          onClick={close}
        >
          ✕
        </button>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop backdrop-blur-sm">
        <button onClick={close}>close</button>
      </form>
    </dialog>
  )
}
