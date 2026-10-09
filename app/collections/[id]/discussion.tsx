'use client'
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
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Changes when: user expands a different game accordion
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getComments(props.gameId).then((data) => {
      setComments(data)
      // Collapsed by default when empty, expanded by default when there's a thread
      setOpen(data.length > 0)
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
      setOpen(true)
      setDraft('')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    setDeletingId(commentId)
    try {
      await deleteComment(commentId)
      const remaining = comments.filter((c) => c.id !== commentId)
      setComments(remaining)
      if (remaining.length === 0) setOpen(false)
    } finally {
      setDeletingId(null)
    }
  }

  const authorName = (c: CommentData) => c.authorLichessUsername ?? c.authorEmail.split('@')[0]

  return (
    <div
      className={`col-span-full border border-base-300 rounded bg-base-100
        ${open ? 'collapse collapse-open' : 'collapse collapse-close'} collapse-arrow`}
    >
      <button
        className="collapse-title flex items-center gap-2 text-sm font-medium text-base-content/70
          min-h-0 py-2.5 px-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        Discussion
        {!loading && comments.length > 0 && (
          <span className="badge badge-sm badge-ghost">{comments.length}</span>
        )}
      </button>

      <div className="collapse-content px-4">
        {loading ? (
          <div className="py-2 flex justify-center">
            <span className="loading loading-spinner" />
          </div>
        ) : (
          <div className="flex flex-col pb-2">
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

            {comments.length === 0 && (
              <p className="text-base-content/40 text-sm mb-2">No comments yet</p>
            )}

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
              <p className="text-base-content/40 text-sm">Log in to join the discussion</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Discussion
