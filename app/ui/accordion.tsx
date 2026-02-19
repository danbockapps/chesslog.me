'use client'
import './accordion.css'

import {FC, PropsWithChildren, ReactNode, useState} from 'react'
import Card from './card'

interface Props {
  header: ReactNode
  cardClassName?: string
  headerClassName?: string
  contentClassName?: string
  onExpand?: () => void
  initialOpen?: boolean
}

const Accordion: FC<PropsWithChildren<Props>> = (props) => {
  const [isOpen, setIsOpen] = useState(props.initialOpen ?? false)
  const contentClassName = props.contentClassName ?? ''

  return (
    <Card className={props.cardClassName}>
      <div
        onClick={() => {
          if (props.onExpand && !isOpen) props.onExpand()
          setIsOpen(!isOpen)
        }}
        className={`cursor-pointer ${props.headerClassName ?? ''}`}
      >
        {props.header}
      </div>

      <div className={`accordion-wrapper ${isOpen ? 'is-open' : ''}`}>
        <div className={`accordion-inner ${isOpen && contentClassName}`}>
          {isOpen && props.children}
        </div>
      </div>
    </Card>
  )
}

export default Accordion
