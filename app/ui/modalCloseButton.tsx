import {FC} from 'react'

interface Props {
  onClick: () => void
  disabled?: boolean
  /**
   * Use for modal-boxes with scrolling content, where an absolutely
   * positioned button would scroll out of view.
   */
  sticky?: boolean
}

/**
 * Shared close button for daisyUI modals, following the daisyUI docs pattern:
 * a ghost circle button in the top-right corner of the modal-box.
 */
const ModalCloseButton: FC<Props> = (props) => {
  const position = props.sticky ? 'sticky float-right top-2 mr-2 z-10' : 'absolute right-2 top-2'
  return (
    <button
      className={`btn btn-sm btn-circle btn-ghost ${position}`}
      aria-label="close"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      ✕
    </button>
  )
}

export default ModalCloseButton
