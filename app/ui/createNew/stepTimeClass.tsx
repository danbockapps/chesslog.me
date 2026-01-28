import {FC} from 'react'
import Back from '../back'
import Button from '../button'
import {Step, Type, TimeClass} from './createNewModal'

interface Props {
  setStep: (step: Step) => void
  type: Type
  timeClass: TimeClass
  setTimeClass: (timeClass: TimeClass) => void
}

const StepTimeClass: FC<Props> = (props) => {
  const options =
    props.type === 'lichess'
      ? [
          {value: 'ultraBullet' as const, label: 'UltraBullet'},
          {value: 'bullet' as const, label: 'Bullet'},
          {value: 'blitz' as const, label: 'Blitz'},
          {value: 'rapid' as const, label: 'Rapid'},
          {value: 'classical' as const, label: 'Classical'},
        ]
      : [
          {value: 'bullet' as const, label: 'Bullet'},
          {value: 'blitz' as const, label: 'Blitz'},
          {value: 'rapid' as const, label: 'Rapid'},
        ]

  return (
    <>
      <Back onClick={() => props.setStep('username')} />
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Optional: Filter games by time control. Leave unselected to import all games.
        </p>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => props.setTimeClass(option.value)}
              className={`w-full p-3 rounded border-2 transition-colors ${
              props.timeClass === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={() => props.setStep('name')} variant="contained" fullWidth>
        Next
      </Button>
    </>
  )
}

export default StepTimeClass
