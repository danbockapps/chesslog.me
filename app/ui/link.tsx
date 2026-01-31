import {FC, AnchorHTMLAttributes} from 'react'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

const AppLink: FC<LinkProps> = ({children, className = '', ...props}) => {
  return (
    <a className={`link link-hover ${className}`} {...props}>
      {children}
    </a>
  )
}

export default AppLink
