"use client"

import { useMemo, useState } from 'react'
import { sampleData } from '@/lib/sampleData'
import { BarChartViz } from '@/components/charts/BarChartViz'
import { AnimateCard } from '@/components/AnimateCard'
import { TreemapViz } from '@/components/charts/TreemapViz'

export default function ThemesPage(){
  const data = sampleData
  const { themes, reviews, dates } = data
  const [months, setMonths] = useState<number>(12)

  const cutoff = useMemo(()=>dates.sort((a,b)=>a.date.getTime()-b.date.getTime()).slice(-months).map(d=>d.dateKey), [dates, months])
  const filtered = useMemo(()=>reviews.filter(r=>cutoff.includes(r.dateKey)), [reviews, cutoff])

  const themeStats = useMemo(()=>{
    const map = new Map<string, { name:string, count:number, sent:number }>()
    for (const t of themes) map.set(t.themeId, { name: t.name, count: 0, sent: 0 })
    for (const r of filtered){
      for (const t of r.themeIds){
        const slot = map.get(t)
        if (!slot) continue
        slot.count += 1
        slot.sent += r.sentimentScore
      }
    }
    return Array.from(map.values()).map(v=>({ name: v.name, volume: v.count, sentiment: v.count? Number((v.sent/v.count).toFixed(2)) : 0 }))
  }, [filtered, themes])

  const recentQuotes = useMemo(()=>filtered.slice(-20).reverse(), [filtered])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Themes</h3>
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
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Theme Volume</h3>
          <BarChartViz data={themeStats.map(t=>({name:t.name, value:t.volume}))} xKey="name" barKey="value" color="#8b5cf6" />
        </AnimateCard>
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Theme Sentiment</h3>
          <BarChartViz data={themeStats.map(t=>({name:t.name, value:t.sentiment}))} xKey="name" barKey="value" color="#10b981" />
        </AnimateCard>
      </div>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-2">Theme Composition (Treemap)</h3>
        <TreemapViz data={themeStats.map(t=>({ name: t.name, value: t.volume }))} />
      </AnimateCard>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-3">Recent Quotes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recentQuotes.map((q)=> (
            <div key={q.reviewId} className="kpi">
              <div className="text-sm text-slate-600 mb-2">{new Date(q.dateKey+'-01').toLocaleDateString(undefined,{month:'short', year:'2-digit'})}</div>
              <div className="text-slate-800">{q.text}</div>
              <div className="mt-2 text-xs text-slate-500">Rating: {q.rating} • Sentiment: {q.sentimentScore.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </AnimateCard>
    </div>
  )
}