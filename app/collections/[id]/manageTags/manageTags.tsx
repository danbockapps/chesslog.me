import SectionHeader from '@/app/ui/SectionHeader'
import {Close, Lock, Public as PublicIcon} from '@mui/icons-material'
import {Box, Dialog, Divider, IconButton, Typography} from '@mui/material'
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
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            height: {xs: '98%', md: 'auto'},
            maxHeight: '90vh',
            padding: 0,
          },
        },
      }}
    >
      <Box sx={{p: 3, pb: 2, position: 'relative'}}>
        <SectionHeader title="Manage Tags" description="View and edit your tag descriptions" />
        <IconButton
          onClick={props.close}
          sx={{position: 'absolute', top: 8, right: 8}}
          aria-label="close"
        >
          <Close />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{px: 3, py: 2, overflow: 'auto', maxHeight: 'calc(90vh - 120px)'}}>
        {/* Private Tags Section */}
        <Box sx={{mb: 4}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
            <Lock sx={{fontSize: 20, color: 'text.secondary'}} />
            <Typography variant="h6" sx={{fontWeight: 600}}>
              Your Private Tags
            </Typography>
          </Box>

          {privateTags.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{fontStyle: 'italic', py: 2, textAlign: 'center'}}
            >
              No private tags yet. Create tags when annotating games.
            </Typography>
          ) : (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
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
            </Box>
          )}
        </Box>

        <Divider sx={{my: 3}} />

        {/* Public Tags Section */}
        <Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
            <PublicIcon sx={{fontSize: 20, color: 'text.secondary'}} />
            <Typography variant="h6" sx={{fontWeight: 600}}>
              Public Tags
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ml: 0.5}}>
              (Available to all users)
            </Typography>
          </Box>

          {publicTags.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{fontStyle: 'italic', py: 2, textAlign: 'center'}}
            >
              No public tags available.
            </Typography>
          ) : (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
              {publicTags.map((t) => (
                <TagCard
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  description={t.description}
                  isPublic={true}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

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
