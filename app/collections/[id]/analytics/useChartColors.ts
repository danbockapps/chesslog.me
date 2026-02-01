'use client'

import {useEffect, useState} from 'react'

export function useChartColors() {
  const [colors, setColors] = useState({
    primary: '',
    success: '',
    error: '',
    neutral: '',
    baseContent: '',
    base100: '',
  })

  useEffect(() => {
    // Create a temporary div with daisyUI color classes to extract actual colors
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.visibility = 'hidden'
    document.body.appendChild(tempDiv)

    const getColorFromClass = (className: string): string => {
      tempDiv.className = className
      return getComputedStyle(tempDiv).backgroundColor
    }

    setColors({
      primary: getColorFromClass('bg-primary'),
      success: getColorFromClass('bg-success'),
      error: getColorFromClass('bg-error'),
      neutral: getColorFromClass('bg-neutral'),
      baseContent: getColorFromClass('bg-base-content'),
      base100: getColorFromClass('bg-base-100'),
    })

    document.body.removeChild(tempDiv)
  }, [])

  return colors
}
