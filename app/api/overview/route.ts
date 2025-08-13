import { NextRequest } from 'next/server'
import { aggregateOverview, type OverviewFilters } from '@/lib/aggregate'

// Simple in-memory LRU cache
const CACHE_LIMIT = 50
const cache = new Map<string, any>()

function isDefault(body: OverviewFilters){
  return body.selectedCategoryIds.length===0 && body.selectedBrandIds.length===0 && body.selectedRetailerIds.length===0 && body.selectedRegions.length===0 && body.selectedThemes.length===0 && body.selectedAttributes.length===0 && body.productQuery==='' && body.timeframe.mode==='preset' && (body.timeframe as any).months===12 && body.granularity==='month'
}

export async function POST(req: NextRequest){
  let body: OverviewFilters
  try {
    body = await req.json() as OverviewFilters
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
  if (!body || typeof body !== 'object'){
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
  if (isDefault(body)){
    try {
      const url = new URL('/aggregates/default.json', req.nextUrl.origin)
      const res = await fetch(url)
      if (res.ok){
        const json = await res.json()
        return new Response(JSON.stringify(json), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } })
      }
    } catch {}
  }
  const key = JSON.stringify(body)
  if (cache.has(key)){
    const val = cache.get(key)
    cache.delete(key); cache.set(key, val)
    return new Response(JSON.stringify(val), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' } })
  }
  const { sampleData } = await import('@/lib/sampleData')
  const result = aggregateOverview(sampleData, body)
  cache.set(key, result)
  if (cache.size > CACHE_LIMIT){
    const firstKey = cache.keys().next().value as string | undefined
    if (firstKey) cache.delete(firstKey)
  }
  return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' } })
}