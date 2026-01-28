interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({children, className = '', onClick}) => {
  return (
    <div className={`rounded-lg shadow-md bg-surface ${className}`} {...{onClick}}>
      {children}
    </div>
  )
}

export default Card
