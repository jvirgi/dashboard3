"use client"

import { useMemo, useState } from 'react'
import { sampleData } from '@/lib/sampleData'
import { BarChartViz } from '@/components/charts/BarChartViz'
import { FilterBar } from '@/components/FilterBar'

export default function RetailerPage(){
  const data = sampleData
  const { retailers, dates, reviews, brands, products, categories } = data

  const [months, setMonths] = useState<number>(12)

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
    return Array.from(map.values()).map(v=>({name:v.name, value: v.count? Number((v.avg/v.count).toFixed(2)) : 0}))
  }, [filteredReviews, retailers])

  const volumeByRetailer = useMemo(()=>{
    const map = new Map<string, { name:string, count:number }>()
    for (const r of retailers) map.set(r.retailerId, {name:r.name, count:0})
    for (const r of filteredReviews){
      const slot = map.get(r.retailerId)
      if (!slot) continue
      slot.count += 1
    }
    return Array.from(map.values()).map(v=>({name:v.name, value:v.count}))
  }, [filteredReviews, retailers])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Retailer Comparison</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Months:</span>
            <select className="border rounded-md px-2 py-1" value={months} onChange={(e)=>setMonths(Number(e.target.value))}>
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={18}>18</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Avg Rating by Retailer</h3>
          <BarChartViz data={byRetailer} xKey="name" barKey="value" color="#ef4444" />
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Review Volume by Retailer</h3>
          <BarChartViz data={volumeByRetailer} xKey="name" barKey="value" color="#f59e0b" />
        </div>
      </div>
    </div>
  )
}