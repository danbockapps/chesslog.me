import AppLink from '@/app/ui/link'
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
    <div
      className={`p-4 bg-base-200 rounded-2xl border border-base-300 transition-all ${
        !isPublic ? 'hover:border-primary hover:bg-base-300' : '' }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`badge badge-sm font-medium ${isPublic ? 'bg-success text-white' : 'bg-primary text-white'} px-3`}
        >
          {name}
        </span>
      </div>

      <div className="pl-1">
        {isPublic ? (
          <p className="text-sm text-base-content/70 leading-relaxed">
            {description || 'No description available'}
          </p>
        ) : (
          <AppLink
            onClick={() => onEditDescription?.(id)}
            className="text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            <span>✏️</span>
            {description || 'Add description'}
          </AppLink>
        )}
      </div>
    </div>
  )
}

export default TagCard
