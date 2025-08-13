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
  React.useEffect(()=>{
    setLoading(true)
    fetch('/api/overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(initialFilters) })
      .then(r=>r.json())
      .then(setAgg)
      .finally(()=> setLoading(false))
  }, [])
  return { agg, loading, refetch: async (filters: import('./aggregate').OverviewFilters)=>{
    setLoading(true)
    const r = await fetch('/api/overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(filters) })
    const j = await r.json(); setAgg(j); setLoading(false); return j
  } }
}