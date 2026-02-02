'use client'
import {scaleLog} from '@visx/scale'
import {Text} from '@visx/text'
import {Wordcloud} from '@visx/wordcloud'
import {useIsMobile} from '../useIsMobile'

export interface WordData {
  text: string
  value: number
}

const fixedValueGenerator = () => 0.5

function getRotationDegree() {
  const rand = Math.random()
  const degree = rand > 0.5 ? 60 : -60
  return rand * degree
}

const colors = ['#143059', '#2F6B9A', '#82a6c2']

export default function NotesWordCloud({data}: {data: WordData[]}) {
  const isMobile = useIsMobile()

  const width = isMobile ? 350 : 800
  const height = isMobile ? 350 : 500

  const fontScale = scaleLog({
    domain: [Math.min(...data.map((w) => w.value)), Math.max(...data.map((w) => w.value))],
    range: [10, 100],
  })
  const fontSizeSetter = (datum: WordData) => fontScale(datum.value)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
        <div className="text-center">
          <p className="text-base-content/70">No notes found</p>
          <p className="text-sm text-base-content/50 mt-1">Add notes to your games to see themes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center bg-base-200 rounded-lg p-4">
      <Wordcloud
        words={data}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={'Impact'}
        padding={2}
        spiral={'rectangular'}
        rotate={getRotationDegree}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={'middle'}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </div>
  )
}
