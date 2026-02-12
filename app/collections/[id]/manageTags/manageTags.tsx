import SectionHeader from '@/app/ui/SectionHeader'
import {FC, useCallback, useEffect, useState} from 'react'
import {useAppContext} from '../../context'
import {getTagsWithDetails} from '../actions/crudActions'
import {saveTagDescription} from './actions'
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
  const [descToEdit, setDescToEdit] = useState<number | null>(null)
  const {user} = useAppContext()

  const refresh = useCallback(async () => {
    try {
      const data = await getTagsWithDetails()
      setTags(data.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')))
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (props.open) {
      refresh()
    }
  }, [props.open, refresh])

  const privateTags = tags.filter((t) => !t.public)
  const publicTags = tags.filter((t) => t.public)

  return (
    <dialog className={`modal ${props.open ? 'modal-open' : ''}`}>
      <div className="modal-box w-full max-w-3xl h-auto max-h-[90vh] p-0">
        <div className="p-6 pb-4 relative">
          <SectionHeader title="Manage Tags" description="View and edit your tag descriptions" />
          <button
            onClick={props.close}
            className="btn btn-ghost btn-sm btn-circle absolute top-2 right-2"
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div className="divider m-0"></div>

        <div className="px-6 py-4 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Private Tags Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base-content/70">🔒</span>
              <h3 className="text-lg font-semibold">Your Private Tags</h3>
            </div>

            {privateTags.length === 0 ? (
              <p className="text-sm text-base-content/70 italic py-4 text-center">
                No private tags yet. Create tags when annotating games.
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
                  />
                ))}
              </div>
            )}
          </div>

          <div className="divider my-6"></div>

          {/* Public Tags Section */}
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
