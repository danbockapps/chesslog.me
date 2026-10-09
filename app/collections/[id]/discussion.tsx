'use client'
import SectionHeader, {captionClassNames} from '@/app/ui/SectionHeader'
import {FC, useEffect, useState} from 'react'
import {addComment, deleteComment, getComments} from './actions/commentActions'

interface CommentData {
  id: number
  text: string
  createdAt: string
  userId: string
  authorLichessUsername: string | null
  authorEmail: string
}

interface Props {
  gameId: number
  currentUserId: string | null
}

const Discussion: FC<Props> = (props) => {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Changes when: user expands a different game accordion
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getComments(props.gameId).then((data) => {
      setComments(data)
      setLoading(false)
    })
  }, [props.gameId])

  const handlePost = async () => {
    const text = draft.trim()
    if (!text) return
    setPosting(true)
    try {
      await addComment(props.gameId, text)
      setComments(await getComments(props.gameId))
      setDraft('')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    setDeletingId(commentId)
    try {
      await deleteComment(commentId)
      setComments((cs) => cs.filter((c) => c.id !== commentId))
    } finally {
      setDeletingId(null)
    }
  }

  const authorName = (c: CommentData) => c.authorLichessUsername ?? c.authorEmail.split('@')[0]

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Discussion"
        description="Comments visible to everyone viewing this game"
      />

      {loading ? (
        <div className="py-4 flex justify-center">
          <span className="loading loading-spinner" />
        </div>
      ) : (
        <>
          {comments.length > 0 && (
            <ul className="flex flex-col gap-2 mb-3">
              {comments.map((c) => (
                <li key={c.id} className="p-2 border border-base-300 rounded bg-base-100 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base-content/60 text-xs font-medium">
                      {authorName(c)} · {new Date(c.createdAt).toLocaleString()}
                    </span>
                    {props.currentUserId === c.userId && (
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        aria-label="Delete comment"
                      >
                        {deletingId === c.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          '✕'
                        )}
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap mt-1">{c.text}</p>
                </li>
              ))}
            </ul>
          )}

          {comments.length === 0 && <p className={`${captionClassNames} mb-2`}>No comments yet</p>}

          {props.currentUserId ? (
            <div className="flex flex-col items-end">
              <textarea
                className="self-stretch p-2 mb-2 border border-base-300 rounded bg-base-100
                  text-base-content"
                placeholder="Add a comment..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={posting}
              />
              <button
                className="btn w-32 whitespace-nowrap relative"
                disabled={posting || !draft.trim()}
                onClick={handlePost}
              >
                {posting && (
                  <span className="loading loading-spinner absolute left-1/2 -translate-x-1/2"></span>
                )}
                <span className={posting ? 'opacity-30' : ''}>Post comment</span>
              </button>
            </div>
          ) : (
            <p className={`${captionClassNames}`}>Log in to join the discussion</p>
          )}
        </>
      )}
    </div>
  )
}

export default Discussion
