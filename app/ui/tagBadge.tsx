import {FC} from 'react'

interface Props {
  name: string
  isPublic: boolean
  className?: string
  maxWidth?: string
}

const TagBadge: FC<Props> = ({name, isPublic, className = '', maxWidth = '140px'}) => (
  <span
    className={`badge ${isPublic ? 'badge-primary text-primary-content' : 'badge-neutral text-neutral-content'} px-3
      ${className}`}
    style={{maxWidth, display: 'inline-flex'}}
    title={name}
  >
    <span className="whitespace-nowrap overflow-hidden text-ellipsis block">{name}</span>
  </span>
)

export default TagBadge
