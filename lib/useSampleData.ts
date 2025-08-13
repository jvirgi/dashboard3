"use client"

import * as React from 'react'
import type { DataModel } from '@/lib/types'

let cache: DataModel | null = null
let inflight: Promise<DataModel> | null = null

function reviveData(json: any): DataModel {
  const data = json as DataModel
  // ensure dates have Date objects
  if (Array.isArray((data as any).dates)){
    (data as any).dates = (data as any).dates.map((d: any) => ({ ...d, date: new Date(d.dateKey + '-01') }))
  }
  // ensure reviews have reviewDate Date objects
  if (Array.isArray((data as any).reviews)){
    (data as any).reviews = (data as any).reviews.map((r: any) => ({
      ...r,
      reviewDate: r.reviewDate ? new Date(r.reviewDate) : new Date((r.dateKeyDay || (r.dateKey + '-01')))
    }))
  }
  return data
}

async function loadData(): Promise<DataModel> {
  if (cache) return cache
  if (!inflight) {
    inflight = (async () => {
      // Prefer pre-baked static JSON if present
      if (typeof window !== 'undefined') {
        try {
          const res = await fetch('/data.json', { cache: 'force-cache' })
          if (res.ok) {
            const json = await res.json()
            cache = reviveData(json)
            return cache
          }
        } catch {}
      }
      // Fallback to dynamic import generator
      const mod = await import('@/lib/sampleData')
      cache = mod.sampleData
      return cache
    })()
  }
  return inflight
}

export function useSampleData(opts: { enabled?: boolean; lazy?: boolean } = {}){
  const { enabled = true, lazy = false } = opts
  const [data, setData] = React.useState<DataModel | null>(cache)
  const start = React.startTransition ? React.startTransition : (fn: any)=>fn()

  React.useEffect(()=>{
    if (!enabled) return
    if (data) return
    if (lazy && typeof window !== 'undefined' && 'requestIdleCallback' in window){
      const id = (window as any).requestIdleCallback(()=>{ loadData().then(d=> start(()=> setData(d))) }, { timeout: 2000 })
      return ()=> (window as any).cancelIdleCallback?.(id)
    } else {
      loadData().then(d=> start(()=> setData(d)))
    }
  }, [enabled, lazy, data])

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
    // abort previous in-flight request
    if (abortRef.current){ try { abortRef.current.abort() } catch {}
    }
    const ctrl = new AbortController(); abortRef.current = ctrl
    setLoading(true)
    try {
      const r = await fetch('/api/overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: key, signal: ctrl.signal })
      const j = await r.json(); setAgg(j); lastKey.current = key; return j
    } catch (e: any) {
      if (e?.name !== 'AbortError') { console.error(e) }
      return agg
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