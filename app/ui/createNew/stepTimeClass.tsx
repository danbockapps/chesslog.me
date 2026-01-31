import {FC} from 'react'
import Back from '../back'
import {Step, TimeClass, Type} from './createNewModal'

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
        <p className="text-sm text-text-secondary">
          Optional: Filter games by time control. Leave unselected to import all games.
        </p>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => props.setTimeClass(option.value)}
              className={`w-full p-3 rounded border-2 transition-colors ${
              props.timeClass === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-base-300 hover:border-base-content'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => props.setStep('name')} className="btn w-full">
        Next
      </button>
    </>
  )
}

export default StepTimeClass
