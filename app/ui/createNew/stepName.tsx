import {FC} from 'react'
import Back from '../back'
import {Step, TimeClass, Type} from './createNewModal'

interface Props {
  setType: (type: Type) => void
  setStep: (step: Step) => void
  type: Type
  timeClass: TimeClass
  name: string
  setName: (name: string) => void
  create: () => void
}

const StepName: FC<Props> = (props) => (
  <>
    <Back
      onClick={() => {
        if (props.type === 'manual') {
          props.setType(null)
          props.setStep('type')
        } else {
          props.setStep('timeClass')
        }
      }}
    />
    <input
      type="text"
      placeholder="Collection name"
      className="w-full p-2 border border-border rounded bg-surface text-text-primary"
      value={props.name}
      onChange={(e) => props.setName(e.target.value)}
    />
    Optional: Enter a name for your collection.
    <button onClick={props.create} className="btn w-full">
      Create collection
    </button>
  </>
)

export default StepName
