'use client'

import {FC, useState} from 'react'

const CopyButton: FC<{text: string}> = ({text}) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" className="btn btn-sm btn-primary" onClick={copy}>
      {copied ? 'Copied!' : 'Copy to clipboard'}
    </button>
  )
}

export default CopyButton
