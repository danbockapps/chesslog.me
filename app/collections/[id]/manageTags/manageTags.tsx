import SectionHeader from '@/app/ui/SectionHeader'
import {FC, useCallback, useEffect, useState} from 'react'
import {getTagsWithDetails} from '../actions/crudActions'
import {
  createTag,
  deleteTag,
  getDeletedTags,
  getShowPublicTags,
  renameTag,
  restoreTag,
  saveTagDescription,
  setShowPublicTags,
} from './actions'
import DescriptionDialog from './descriptionDialog'
import TagCard from './tagCard'

interface Props {
  open: boolean
  close: () => void
}

type Tag = {
  id: number
  name: string | null
  description: string | null
  public: boolean | null
}

const ManageTags: FC<Props> = (props) => {
  const [tags, setTags] = useState<Tag[]>([])
  const [deletedTags, setDeletedTags] = useState<Tag[]>([])
  const [descToEdit, setDescToEdit] = useState<number | null>(null)
  const [addingTag, setAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPublic, setShowPublic] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const byName = (a: Tag, b: Tag) => (a.name ?? '').localeCompare(b.name ?? '')
      const [data, deleted, showPublicPref] = await Promise.all([
        getTagsWithDetails(),
        getDeletedTags(),
        getShowPublicTags(),
      ])
      setTags(data.sort(byName))
      setDeletedTags(deleted.sort(byName))
      setShowPublic(showPublicPref)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }, [])

  const handleToggleShowPublic = async (value: boolean) => {
    setShowPublic(value)
    await setShowPublicTags(value)
    await refresh()
  }

  useEffect(() => {
    if (props.open) {
      refresh()
    }
  }, [props.open, refresh])

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    setSaving(true)
    try {
      await createTag(newTagName.trim(), newTagDescription.trim())
      await refresh()
      setNewTagName('')
      setNewTagDescription('')
      setAddingTag(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelAdd = () => {
    setAddingTag(false)
    setNewTagName('')
    setNewTagDescription('')
  }

  const handleDeleteTag = async (tagId: number) => {
    await deleteTag(tagId)
    await refresh()
  }

  const handleRestoreTag = async (tagId: number) => {
    await restoreTag(tagId)
    await refresh()
  }

  const handleRenameTag = async (tagId: number, name: string) => {
    await renameTag(tagId, name)
    await refresh()
  }

  const privateTags = tags.filter((t) => !t.public)
  const publicTags = tags.filter((t) => t.public)

  return (
    <dialog className={`modal ${props.open ? 'modal-open' : ''}`}>
      <div className="modal-box w-full max-w-3xl h-[90vh] p-0 flex flex-col">
        <div className="p-6 pb-4 relative">
          <SectionHeader title="Manage Tags" description="View and edit your tag descriptions" />
          <button
            onClick={props.close}
            className="btn btn-ghost btn-circle absolute top-2 right-2 text-xl"
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div className="divider m-0"></div>

        <div className="px-6 py-4 overflow-auto flex-1">
          {/* Private Tags Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base-content/70">🔒</span>
              <h3 className="text-lg font-semibold">Your Private Tags</h3>
              {!addingTag && (
                <button
                  className="btn btn-xs btn-outline btn-primary ml-auto"
                  onClick={() => setAddingTag(true)}
                >
                  + Add Tag
                </button>
              )}
            </div>

            {addingTag && (
              <div
                className="bg-base-200 border border-base-300 rounded-2xl p-4 mb-4 flex flex-col
                  gap-3"
              >
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  autoFocus
                />
                <textarea
                  className="textarea textarea-bordered textarea-sm w-full resize-none"
                  placeholder="Description (optional)"
                  rows={2}
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={handleCancelAdd}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleAddTag}
                    disabled={!newTagName.trim() || saving}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {privateTags.length === 0 ? (
              <p className="text-sm text-base-content/70 italic py-4 text-center">
                No private tags yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {privateTags.map((t) => (
                  <TagCard
                    key={t.id}
                    id={t.id}
                    name={t.name}
                    description={t.description}
                    isPublic={false}
                    onEditDescription={setDescToEdit}
                    onDelete={handleDeleteTag}
                    onRename={handleRenameTag}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Deleted Tags Section (collapsed by default) */}
          {deletedTags.length > 0 && (
            <>
              <div className="divider my-6"></div>
              <div
                className="collapse collapse-arrow bg-base-200 border border-base-300 rounded-2xl"
              >
                <input type="checkbox" />
                <div className="collapse-title flex items-center gap-2 font-semibold">
                  <span className="text-base-content/70">🗑️</span>
                  Deleted Tags
                  <span className="text-xs font-normal text-base-content/70">
                    ({deletedTags.length})
                  </span>
                </div>
                <div className="collapse-content">
                  <div className="flex flex-col gap-4 pt-2">
                    {deletedTags.map((t) => (
                      <TagCard
                        key={t.id}
                        id={t.id}
                        name={t.name}
                        description={t.description}
                        isPublic={false}
                        isDeleted
                        onRestore={handleRestoreTag}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="divider my-6"></div>

          {/* Enable Public Tags toggle */}
          <label className="flex items-center gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={showPublic}
              onChange={(e) => handleToggleShowPublic(e.target.checked)}
            />
            <span className="flex flex-col">
              <span className="font-medium">Enable public tags</span>
              <span className="text-xs text-base-content/70">
                Show shared tags as options when annotating games
              </span>
            </span>
          </label>

          {/* Public Tags Section */}
          {showPublic && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base-content/70">🌐</span>
                <h3 className="text-lg font-semibold">Public Tags</h3>
                <span className="text-xs text-base-content/70 ml-1">(Available to all users)</span>
              </div>

              {publicTags.length === 0 ? (
                <p className="text-sm text-base-content/70 italic py-4 text-center">
                  No public tags available.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {publicTags.map((t) => (
                    <TagCard
                      key={t.id}
                      id={t.id}
                      name={t.name}
                      description={t.description}
                      isPublic={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {descToEdit && (
          <DescriptionDialog
            open={descToEdit !== null}
            onClose={() => setDescToEdit(null)}
            existingDescription={tags.find((t) => t.id === descToEdit)?.description ?? null}
            onApply={async (description) => {
              await saveTagDescription(descToEdit, description)
              await refresh()
              setDescToEdit(null)
            }}
          />
        )}
      </div>
      <form method="dialog" className="modal-backdrop backdrop-blur-sm" onClick={props.close}>
        <button>close</button>
      </form>
    </dialog>
  )
}

export default ManageTags
