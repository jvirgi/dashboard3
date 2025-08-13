import { NextRequest } from 'next/server'
import { aggregateOverview, type OverviewFilters } from '@/lib/aggregate'

export async function POST(req: NextRequest){
  const body = await req.json() as OverviewFilters
  const { sampleData } = await import('@/lib/sampleData')
  const result = aggregateOverview(sampleData, body)
  return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } })
}