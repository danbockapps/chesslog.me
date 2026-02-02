import {FC, useState} from 'react'

interface Props {
  open: boolean
  onClose: () => void
  existingDescription: string | null
  onApply: (description: string) => void
}

const DescriptionDialog: FC<Props> = (props) => {
  const [description, setDescription] = useState(props.existingDescription ?? '')

  return (
    <dialog className={`modal ${props.open ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <textarea
          className="w-60 h-40 border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="modal-action">
          <button className="btn" onClick={props.onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => props.onApply(description)}>
            Save
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop backdrop-blur-sm" onClick={props.onClose}>
        <button>close</button>
      </form>
    </dialog>
  )
}
export default DescriptionDialog
