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
    <button
      onClick={() => {
        props.setType('manual')
        props.setStep('name')
      }}
      className="w-full flex items-center justify-center h-14 bg-base-200 hover:bg-base-300 text-base-content p-4
        rounded-lg border-0 cursor-pointer transition-colors mb-0"
    >
      <span className="flex-grow">Manual Collection</span>
    </button>
    Use this for OTB games.
    <button
      onClick={() => {
        props.setType('chess.com')
        props.setStep('username')
      }}
      className="w-full flex items-center justify-center bg-chesscom p-2 mt-4 mb-0 rounded"
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
      className="w-full flex items-center justify-center gap-2 bg-lichess p-2 mt-4 rounded"
    >
      <Image src={lichessLogo} width={24} height={24} alt="Lichess" className="h-10 w-10 mr-2" />
      <span className="text-white">Lichess</span>
    </button>
    Your games will be imported from Lichess.
  </>
)

export default StepType
