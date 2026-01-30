import AppLink from '@/app/ui/link'
import {Edit} from '@mui/icons-material'
import {Box, Chip, Typography} from '@mui/material'
import {FC} from 'react'

interface Props {
  id: number
  name: string | null
  description: string | null
  isPublic: boolean
  onEditDescription?: (tagId: number) => void
}

const TagCard: FC<Props> = ({id, name, description, isPublic, onEditDescription}) => {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        ...(!isPublic && {
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }),
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
        <Chip
          label={name}
          size="small"
          sx={{
            fontWeight: 500,
            bgcolor: isPublic ? 'success.dark' : 'primary.dark',
            color: 'white',
            '& .MuiChip-label': {px: 1.5},
          }}
        />
      </Box>

      <Box sx={{pl: 0.5}}>
        {isPublic ? (
          <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1.6}}>
            {description || 'No description available'}
          </Typography>
        ) : (
          <AppLink
            onClick={() => onEditDescription?.(id)}
            sx={{
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': {gap: 1},
              transition: 'gap 0.2s',
            }}
          >
            <Edit sx={{fontSize: 16}} />
            {description || 'Add description'}
          </AppLink>
        )}
      </Box>
    </Box>
  )
}

export default TagCard
