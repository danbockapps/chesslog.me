import {FC, useEffect, useState} from 'react'
import {createCollection} from './actions'
import StepName from './stepName'
import StepTimeClass from './stepTimeClass'
import StepType from './stepType'
import StepUsername from './stepUsername'

interface Props {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export type Step = 'type' | 'username' | 'timeClass' | 'name'
export type Type = 'manual' | 'chess.com' | 'lichess' | null
export type TimeClass = 'ultraBullet' | 'bullet' | 'blitz' | 'rapid' | 'classical' | null

const CreateNewModal: FC<Props> = (props) => {
  const [step, setStep] = useState<Step>('type')
  const [type, setType] = useState<Type>(null)
  const [username, setUsername] = useState<string>('')
  const [timeClass, setTimeClass] = useState<TimeClass>(null)
  const [name, setName] = useState<string>('')

  // Changes when: the modal is closed
  useEffect(() => {
    if (!props.isOpen) {
      setStep('type')
      setType(null)
      setUsername('')
      setTimeClass(null)
      setName('')
    }
  }, [props.isOpen])

  return (
    <dialog className={`modal ${props.isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => props.setIsOpen(false)}
        >
          ✕
        </button>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Create new collection</h2>
          {step === 'type' && <StepType {...{setType, setStep}} />}

          {step === 'username' && (
            <StepUsername {...{setStep, type, setType, username, setUsername}} />
          )}

          {step === 'timeClass' && <StepTimeClass {...{setStep, type, timeClass, setTimeClass}} />}

          {step === 'name' && (
            <StepName
              {...{setStep, type, setType, username, setUsername, timeClass, name, setName}}
              create={() => {
                props.setIsOpen(false)
                createCollection(type, username, timeClass, name)
              }}
            />
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => props.setIsOpen(false)}>close</button>
      </form>
    </dialog>
  )
}

export default CreateNewModal
