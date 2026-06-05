import {FC} from 'react'
import Back from '../back'
import {Step, Type} from './createNewModal'

interface Props {
  setStep: (step: Step) => void
  setType: (type: Type) => void
  studyUrl: string
  setStudyUrl: (url: string) => void
  name: string
  setName: (name: string) => void
  create: () => void
  loading: boolean
}

const StepStudyUrl: FC<Props> = (props) => (
  <>
    <Back
      onClick={() => {
        props.setType(null)
        props.setStep('type')
      }}
    />
    <input
      type="text"
      placeholder="Lichess study URL"
      className="w-full p-2 border border-base-300 rounded bg-base-100 text-base-content"
      value={props.studyUrl}
      onChange={(e) => props.setStudyUrl(e.target.value)}
      disabled={props.loading}
    />
    <p className="text-sm text-base-content/70">
      Paste a study URL, e.g. https://lichess.org/study/abcd1234
    </p>
    <input
      type="text"
      placeholder="Collection name (optional)"
      className="w-full p-2 border border-base-300 rounded bg-base-100 text-base-content"
      value={props.name}
      onChange={(e) => props.setName(e.target.value)}
      disabled={props.loading}
    />
    <button
      onClick={props.create}
      className="btn w-full"
      disabled={props.loading || !props.studyUrl.trim()}
    >
      {props.loading && <span className="loading loading-spinner"></span>}
      {props.loading ? 'Creating...' : 'Create collection'}
    </button>
  </>
)

export default StepStudyUrl
