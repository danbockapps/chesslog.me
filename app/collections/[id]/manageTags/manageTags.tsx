import AppLink from '@/app/ui/link'
import SectionHeader from '@/app/ui/SectionHeader'
import {Close} from '@mui/icons-material'
import {Dialog, IconButton} from '@mui/material'
import {FC, useCallback, useEffect, useState} from 'react'
import {useAppContext} from '../../context'
import {getTagsWithDetails} from '../actions/crudActions'
import {saveTagDescription} from './actions'
import DescriptionDialog from './descriptionDialog'

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
  }, [user.id])

  useEffect(() => {
    if (props.open) {
      refresh()
    }
  }, [props.open, refresh])

  const privateTags = tags.filter((t) => !t.public)
  const publicTags = tags.filter((t) => t.public)

  return (
    <Dialog
      open={props.open}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {height: {xs: '98%', md: 'auto'}, padding: {xs: 1, md: 2}},
        },
      }}
    >
      <SectionHeader title="Manage Tags" description="Add, edit, and delete tags" />

      <div className="mt-4 overflow-auto flex flex-col items-start">
        <h3 className="self-center my-6">Private tags</h3>
        {privateTags.map((t) => (
          <div key={t.id} className="mb-8 flex flex-col items-start">
            <div className="bg-slate-200 px-2 py-1 rounded text-sm">{t.name}</div>
            <div>
              {t.description ?? (
                <AppLink onClick={() => setDescToEdit(t.id)} sx={{fontSize: '0.8em'}}>
                  Add description
                </AppLink>
              )}
            </div>
          </div>
        ))}

        <h3 className="self-center my-6">Public tags</h3>
        {publicTags.map((t) => (
          <div key={t.id} className="mb-8 flex flex-col items-start">
            <div className="bg-slate-200 px-2 py-1 rounded text-sm">{t.name}</div>
            <div>{t.description ?? ''}</div>
          </div>
        ))}
      </div>

      <IconButton onClick={props.close} sx={{position: 'absolute', top: 1, right: 1}}>
        <Close />
      </IconButton>

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
    </Dialog>
  )
}

export default ManageTags
