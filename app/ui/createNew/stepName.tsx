import {FC} from 'react'
import Back from '../back'
import {Step, Type} from './createNewModal'

interface Props {
  setType: (type: Type) => void
  setStep: (step: Step) => void
  name: string
  setName: (name: string) => void
  create: () => void
  loading: boolean
}

const StepName: FC<Props> = (props) => (
  <>
    <Back
      onClick={() => {
        props.setType(null)
        props.setStep('type')
      }}
    />
    <input
      type="text"
      placeholder="Collection name"
      className="w-full p-2 border border-base-300 rounded bg-base-100 text-base-content"
      value={props.name}
      onChange={(e) => props.setName(e.target.value)}
      disabled={props.loading}
    />
    <p className="text-sm text-base-content/70">Enter a name for your collection.</p>
    <button onClick={props.create} className="btn w-full" disabled={props.loading}>
      {props.loading && <span className="loading loading-spinner"></span>}
      {props.loading ? 'Creating...' : 'Create collection'}
    </button>
  </>
)

export default StepName
