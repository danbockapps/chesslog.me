import {useRouter} from 'next/navigation'
import {FC, useState} from 'react'
import {createCollection} from './actions'
import StepName from './stepName'
import StepStudyUrl from './stepStudyUrl'
import StepTimeClass from './stepTimeClass'
import StepType from './stepType'
import StepUsername from './stepUsername'

interface Props {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export type Step = 'type' | 'username' | 'timeClass' | 'name' | 'studyUrl'
export type Type = 'manual' | 'chess.com' | 'lichess' | 'lichess-study' | null
export type TimeClass = 'ultraBullet' | 'bullet' | 'blitz' | 'rapid' | 'classical' | null

const CreateNewModal: FC<Props> = (props) => {
  const router = useRouter()
  const [step, setStep] = useState<Step>('type')
  const [type, setType] = useState<Type>(null)
  const [username, setUsername] = useState<string>('')
  const [timeClass, setTimeClass] = useState<TimeClass>(null)
  const [name, setName] = useState<string>('')
  const [studyUrl, setStudyUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear any error when moving between steps so it doesn't linger on an unrelated step.
  const goToStep = (next: Step) => {
    setError(null)
    setStep(next)
  }

  const handleClose = () => {
    setStep('type')
    setType(null)
    setUsername('')
    setTimeClass(null)
    setName('')
    setStudyUrl('')
    setLoading(false)
    setError(null)
    props.setIsOpen(false)
  }

  const create = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await createCollection(
        type,
        username,
        timeClass,
        type === 'manual' ? name : null,
        type === 'lichess-study' ? studyUrl : null,
      )
      if ('error' in result) {
        setError(result.error)
        setLoading(false)
        return
      }
      // Keep the spinner up through navigation; the modal unmounts when the new page loads.
      // Study collections don't auto-import, so signal the destination page to pop the import
      // modal immediately rather than making the user hunt for "Refresh from study".
      const dest = `/collections/${result.collectionId}`
      router.push(type === 'lichess-study' ? `${dest}?import=study` : dest)
    } catch {
      setError('Something went wrong creating the collection. Please try again.')
      setLoading(false)
    }
  }

  return (
    <dialog className={`modal ${props.isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={handleClose}
          disabled={loading}
        >
          ✕
        </button>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Create new collection</h2>
          {step === 'type' && <StepType {...{setType, setStep: goToStep}} />}

          {step === 'username' && (
            <StepUsername {...{setStep: goToStep, type, setType, username, setUsername}} />
          )}

          {step === 'timeClass' && (
            <StepTimeClass
              {...{setStep: goToStep, type, timeClass, setTimeClass, create, loading}}
            />
          )}

          {step === 'name' && (
            <StepName {...{setStep: goToStep, setType, name, setName, create, loading}} />
          )}

          {step === 'studyUrl' && (
            <StepStudyUrl
              {...{setStep: goToStep, setType, studyUrl, setStudyUrl, create, loading}}
            />
          )}

          {error && <p className="text-error text-sm">{error}</p>}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop backdrop-blur-sm">
        <button onClick={handleClose} disabled={loading}>
          close
        </button>
      </form>
    </dialog>
  )
}

export default CreateNewModal
