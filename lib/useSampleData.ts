"use client"

import * as React from 'react'
import type { DataModel } from '@/lib/types'

let cache: DataModel | null = null
let inflight: Promise<DataModel> | null = null

async function loadData(): Promise<DataModel> {
  if (cache) return cache
  if (!inflight) {
    inflight = import('@/lib/sampleData').then(m => {
      cache = m.sampleData
      return cache
    })
  }
  return inflight
}

export function useSampleData(){
  const [data, setData] = React.useState<DataModel | null>(cache)
  const [, startTransition] = (React as any).useTransition ? (React as any).useTransition() : [false, (fn: any)=>fn()]
  React.useEffect(()=>{
    if (data) return
    loadData().then(d => startTransition(()=> setData(d)))
  }, [data])
  return data
}