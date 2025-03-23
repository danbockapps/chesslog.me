import Link, {LinkProps} from '@mui/material/Link'
import {FC} from 'react'

// MUI Link doesn't have a cursor pointer by default (?!)

const AppLink: FC<LinkProps> = (props) => {
  const {sx, ...rest} = props

  return <Link sx={{cursor: 'pointer', ...sx}} {...rest} />
}

export default AppLink
