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

// initial aggregates for homepage without loading full data on client
export type OverviewAggregate = Awaited<ReturnType<typeof import('./aggregate')['aggregateOverview']>>

export function useOverviewAggregate(initialFilters: import('./aggregate').OverviewFilters){
  const [agg, setAgg] = React.useState<OverviewAggregate | null>(null)
  const [loading, setLoading] = React.useState(false)
  const lastKey = React.useRef<string>('')
  const abortRef = React.useRef<AbortController | null>(null)

  const fetchAgg = React.useCallback(async (filters: import('./aggregate').OverviewFilters)=>{
    const key = JSON.stringify(filters)
    if (key === lastKey.current && agg) return agg
    abortRef.current?.abort()
    const ctrl = new AbortController(); abortRef.current = ctrl
    setLoading(true)
    try {
      const r = await fetch('/api/overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: key, signal: ctrl.signal })
      const j = await r.json(); setAgg(j); lastKey.current = key; return j
    } finally {
      if (!ctrl.signal.aborted) setLoading(false)
    }
  }, [agg])

  React.useEffect(()=>{ fetchAgg(initialFilters) }, [])

  // debounce refetch to avoid thrash when clearing filters
  const debouncedRefetch = React.useMemo(()=>{
    let t: any
    return (filters: import('./aggregate').OverviewFilters)=>{
      clearTimeout(t)
      t = setTimeout(()=>{ fetchAgg(filters) }, 150)
    }
  }, [fetchAgg])

  return { agg, loading, refetch: debouncedRefetch }
}