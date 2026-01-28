import {Box} from '@mui/material'
import Image from 'next/image'
import {FC} from 'react'
import {Step, Type} from './createNewModal'
import lichessLogo from './lichess.svg'

interface Props {
  setType: (type: Type) => void
  setStep: (step: Step) => void
}

const StepType: FC<Props> = (props) => (
  <>
    <Box
      component="button"
      onClick={() => {
        props.setType('manual')
        props.setStep('name')
      }}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '3.5rem',
        bgcolor: 'action.selected',
        color: 'text.primary',
        p: 1,
        borderRadius: 1,
        border: 0,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <span className="flex-grow">Manual Collection</span>
    </Box>
    Use this for OTB games.
    <button
      onClick={() => {
        props.setType('chess.com')
        props.setStep('username')
      }}
      className="w-full flex items-center justify-center bg-chesscom p-2 rounded"
    >
      <img
        src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpNgJfyb.png"
        alt="Chess.com"
        className="h-10 w-32 mr-2"
      />
    </button>
    Your games will be imported from Chess.com.
    <button
      onClick={() => {
        props.setType('lichess')
        props.setStep('username')
      }}
      className="w-full flex items-center justify-center gap-2 bg-lichess p-2 rounded"
    >
      <Image src={lichessLogo} width={24} height={24} alt="Lichess" className="h-10 w-10 mr-2" />
      <span className="text-white">Lichess</span>
    </button>
    Your games will be imported from Lichess.
  </>
)

export default StepType
