"use client"

import { useMemo, useState, useTransition } from 'react'
import { sampleData } from '@/lib/sampleData'
import { BarChartViz } from '@/components/charts/BarChartViz'
import { AnimateCard } from '@/components/AnimateCard'
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { MonthSegment } from '@/components/MonthSegment'
import { Skeleton } from '@/components/Skeleton'
import { useRouter } from 'next/navigation'
import { ReviewsModal } from '@/components/ReviewsModal'

export default function RetailerPage(){
  const data = sampleData
  const { retailers, dates, reviews, products, brands, categories, themes } = data
  const router = useRouter()

  const [months, setMonths] = useState<number>(12)
  const [isPending, startTransition] = useTransition()
  const [reviewsOpen, setReviewsOpen] = useState(false)

  const cutoff = useMemo(() => dates.sort((a,b)=>a.date.getTime()-b.date.getTime()).slice(-months).map(d=>d.dateKey), [dates, months])

  const filteredReviews = useMemo(()=>reviews.filter(r=>cutoff.includes(r.dateKey)), [reviews, cutoff])

  const byRetailer = useMemo(()=>{
    const map = new Map<string, { name:string, avg:number, count:number }>()
    for (const r of retailers) map.set(r.retailerId, {name:r.name, avg:0, count:0})
    for (const r of filteredReviews){
      const slot = map.get(r.retailerId)
      if (!slot) continue
      slot.avg += r.rating
      slot.count += 1
    }
    return Array.from(map.entries()).map(([id,v])=>({id, name:v.name, value: v.count? Number((v.avg/v.count).toFixed(2)) : 0}))
  }, [filteredReviews, retailers])

  const volumeByRetailer = useMemo(()=>{
    const map = new Map<string, { name:string, count:number }>()
    for (const r of retailers) map.set(r.retailerId, {name:r.name, count:0})
    for (const r of filteredReviews){
      const slot = map.get(r.retailerId)
      if (!slot) continue
      slot.count += 1
    }
    return Array.from(map.entries()).map(([id,v])=>({id, name:v.name, value:v.count}))
  }, [filteredReviews, retailers])

  const heatmap = useMemo(()=>{
    const cols = cutoff.map(k=>k)
    const rows = retailers.map(r=>r.name)
    const idxRetailer = new Map(retailers.map((r,i)=>[r.retailerId, i]))
    const idxCol = new Map(cols.map((c,i)=>[c,i]))
    const mat = Array.from({length: rows.length}, ()=> Array(cols.length).fill(NaN))
    for (const rev of filteredReviews){
      const ri = idxRetailer.get(rev.retailerId)
      const ci = idxCol.get(rev.dateKey)
      if (ri===undefined || ci===undefined) continue
      if (Number.isNaN(mat[ri][ci])) mat[ri][ci] = 0
      // accumulate average via simple mean (could store count separately for precision)
      mat[ri][ci] = Number.isNaN(mat[ri][ci]) ? rev.rating : (mat[ri][ci] + rev.rating) / 2
    }
    return { rows, cols: cols.map(c=>new Date(c+'-01').toLocaleDateString(undefined,{month:'short'})), values: mat }
  }, [filteredReviews, cutoff, retailers])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Retailer Comparison</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Months:</span>
            <MonthSegment value={months} onChange={(v)=>startTransition(()=>setMonths(v))} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Avg Rating by Retailer</h3>
          {isPending ? <Skeleton className="h-80" /> : (
            <div onContextMenu={(e)=>{ e.preventDefault(); setReviewsOpen(true) }}>
              <BarChartViz data={byRetailer} xKey="name" barKey="value" color="#ef4444" onBarClick={(name)=>{ router.push(`/?retailer=${encodeURIComponent(name)}`) }} />
            </div>
          )}
        </AnimateCard>
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Review Volume by Retailer</h3>
          {isPending ? <Skeleton className="h-80" /> : (
            <div onContextMenu={(e)=>{ e.preventDefault(); setReviewsOpen(true) }}>
              <BarChartViz data={volumeByRetailer} xKey="name" barKey="value" color="#f59e0b" onBarClick={(name)=>{ router.push(`/?retailer=${encodeURIComponent(name)}`) }} />
            </div>
          )}
        </AnimateCard>
      </div>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-2">Monthly Avg Rating Heatmap</h3>
        {isPending ? <Skeleton className="h-72" /> : (
          <div onContextMenu={(e)=>{ e.preventDefault(); setReviewsOpen(true) }}>
            <HeatmapGrid rows={retailers.map(r=>r.name)} cols={cutoff.map(c=>new Date(c+'-01').toLocaleDateString(undefined,{month:'short'}))} values={heatmap.values} />
          </div>
        )}
      </AnimateCard>

      <ReviewsModal open={reviewsOpen} onOpenChange={setReviewsOpen} reviews={filteredReviews} products={products} brands={brands} categories={categories} retailers={retailers} themes={themes} />
    </div>
  )
}