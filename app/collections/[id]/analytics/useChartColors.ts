'use client'

import {useState} from 'react'

const empty = {primary: '', success: '', error: '', neutral: '', baseContent: '', base100: ''}

function readChartColors() {
  const tempDiv = document.createElement('div')
  tempDiv.style.position = 'absolute'
  tempDiv.style.visibility = 'hidden'
  document.body.appendChild(tempDiv)

  const getColorFromClass = (className: string): string => {
    tempDiv.className = className
    return getComputedStyle(tempDiv).backgroundColor
  }

  const colors = {
    primary: getColorFromClass('bg-primary'),
    success: getColorFromClass('bg-success'),
    error: getColorFromClass('bg-error'),
    neutral: getColorFromClass('bg-neutral'),
    baseContent: getColorFromClass('bg-base-content'),
    base100: getColorFromClass('bg-base-100'),
  }

  document.body.removeChild(tempDiv)
  return colors
}

export function useChartColors() {
  const [colors] = useState(() => (typeof window === 'undefined' ? empty : readChartColors()))
  return colors
}
