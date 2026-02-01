'use client'

import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'
import {useChartColors} from '../useChartColors'
import {useIsMobile} from '../useIsMobile'
import TagAxisTick from './tagAxisTick'

interface TagStat {
  name: string
  count: number
  public: boolean
}

export default function TagDistributionChart({data}: {data: TagStat[]}) {
  const colors = useChartColors()
  const isMobile = useIsMobile()

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
        <div className="text-center">
          <p className="text-base-content/70">No tags found</p>
          <p className="text-sm text-base-content/50 mt-1">
            Add tags to your games to see distribution
          </p>
        </div>
      </div>
    )
  }

  // Create a lookup map for tag public status
  const tagPublicMap = new Map(data.map((tag) => [tag.name, tag.public]))

  // Custom tick component that knows about the tag's public status
  const CustomTick = (props: any) => {
    const tagName = props.payload?.value || ''
    const isPublic = tagPublicMap.get(tagName) || false
    return <TagAxisTick {...props} isPublic={isPublic} isMobile={isMobile} />
  }

  // Responsive values based on screen size
  const leftMargin = isMobile ? 80 : 155
  const yAxisWidth = isMobile ? 75 : 150

  return (
    <ResponsiveContainer width="100%" height={Math.max(400, data.length * 35)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{left: leftMargin, right: 15, top: 10, bottom: 10}}
        key={colors.primary} // Force re-render when colors change
      >
        <XAxis type="number" stroke={colors.baseContent} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={yAxisWidth}
          stroke="none"
          tick={CustomTick}
          interval={0}
        />
        <Bar dataKey="count" fill={colors.primary} radius={[0, 4, 4, 0]} />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.base100,
            border: `1px solid ${colors.baseContent}33`,
            borderRadius: '0.5rem',
            color: colors.baseContent,
          }}
          cursor={{fill: `${colors.baseContent}10`}}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
