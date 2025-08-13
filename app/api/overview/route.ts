import { NextRequest } from 'next/server'
import { aggregateOverview, type OverviewFilters } from '@/lib/aggregate'

// Simple in-memory LRU cache
const CACHE_LIMIT = 50
const cache = new Map<string, any>()

export async function POST(req: NextRequest){
  const body = await req.json() as OverviewFilters
  const key = JSON.stringify(body)
  if (cache.has(key)){
    const val = cache.get(key)
    // refresh LRU
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