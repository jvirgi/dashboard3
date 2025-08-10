"use client"

import { useCallback } from 'react'
import * as htmlToImage from 'html-to-image'
import { DownloadIcon } from '@radix-ui/react-icons'

export function ExportButton({ targetId, filename }: { targetId: string; filename: string }){
  const onExport = useCallback(async ()=>{
    const node = document.getElementById(targetId)
    if (!node) return
    const dataUrl = await htmlToImage.toPng(node as HTMLElement, { pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  }, [targetId, filename])

  return (
    <button onClick={onExport} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
      <DownloadIcon className="h-3.5 w-3.5"/> Export
    </button>
  )
}