import Link from 'next/link'
import {FC} from 'react'
import Card from '../ui/card'

interface Props {
  id: string
  title: string
  children: React.ReactNode
  className?: string
}

const CollectionCard: FC<Props> = (props) => (
  <Link href={`/collections/${props.id}`}>
    <Card className={`md:w-80 h-48 ${props.className ?? ''}`}>
      <div className="p-2 rounded-t-lg">{props.title}</div>
      <div className="p-4">{props.children}</div>
    </Card>
  </Link>
)

export default CollectionCard
