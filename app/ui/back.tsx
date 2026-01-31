import {FC} from 'react'

interface Props {
  onClick: () => void
}

const Back: FC<Props> = (props) => (
  <button
    onClick={props.onClick}
    className="flex items-center text-base-content p-2 rounded hover:bg-base-200"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    <span className="ml-2">Back</span>
  </button>
)

export default Back
