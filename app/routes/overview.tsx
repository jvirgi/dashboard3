"use client"

import { useMemo, useState, useId } from 'react'
import { format } from 'date-fns'
import { sampleData } from '@/lib/sampleData'
import { ArrowUpRight, Star, MessageSquare, TrendingUp } from 'lucide-react'
import { LineChartViz } from '@/components/charts/LineChartViz'
import { BarChartViz } from '@/components/charts/BarChartViz'
import { KPIStat } from '@/components/KPIStat'
import { FilterBar } from '@/components/FilterBar'
import { StackedRatingArea } from '@/components/charts/StackedRatingArea'
import { AnimateCard } from '@/components/AnimateCard'
import { Sparkline } from '@/components/Sparkline'
import { ExportButton } from '@/components/ExportButton'

export default function OverviewPage() {
  const data = sampleData

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all')
  const [selectedBrandId, setSelectedBrandId] = useState<string | 'all'>('all')
  const [selectedRetailerId, setSelectedRetailerId] = useState<string | 'all'>('all')
  const [months, setMonths] = useState<number>(12)

  const { categories, brands, products, retailers, dates, reviews, themes } = data

  const filtered = useMemo(() => {
    const cutoff = dates
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-months)
      .map((d) => d.dateKey)

    const brandIdsInCategory = selectedCategoryId === 'all'
      ? new Set(brands.map((b) => b.brandId))
      : new Set(brands.filter((b) => b.categoryId === selectedCategoryId).map((b) => b.brandId))

    const productIdsInBrand = selectedBrandId === 'all'
      ? new Set(products.filter((p) => brandIdsInCategory.has(p.brandId)).map((p) => p.productId))
      : new Set(products.filter((p) => p.brandId === selectedBrandId).map((p) => p.productId))

    const filteredReviews = reviews.filter((r) =>
      cutoff.includes(r.dateKey) &&
      productIdsInBrand.has(r.productId) &&
      (selectedRetailerId === 'all' || r.retailerId === selectedRetailerId)
    )

    return { filteredReviews, cutoff }
  }, [reviews, months, dates, brands, products, selectedCategoryId, selectedBrandId, selectedRetailerId])

  const kpis = useMemo(() => {
    const count = filtered.filteredReviews.length
    const avgRating = count === 0 ? 0 : filtered.filteredReviews.reduce((s, r) => s + r.rating, 0) / count
    const avgSent = count === 0 ? 0 : filtered.filteredReviews.reduce((s, r) => s + r.sentimentScore, 0) / count

    const last3 = filtered.filteredReviews.filter((r) => filtered.cutoff.slice(-3).includes(r.dateKey))
    const prev3 = filtered.filteredReviews.filter((r) => filtered.cutoff.slice(-6, -3).includes(r.dateKey))
    const last3Avg = last3.length ? last3.reduce((s, r) => s + r.rating, 0) / last3.length : 0
    const prev3Avg = prev3.length ? prev3.reduce((s, r) => s + r.rating, 0) / prev3.length : 0
    const delta = last3Avg - prev3Avg

    return { count, avgRating, avgSent, delta }
  }, [filtered])

  const trendData = useMemo(() => {
    const byMonth = new Map<string, { date: Date; count: number; avgRating: number; r1: number; r2: number; r3: number; r4: number; r5: number }>()
    for (const d of dates) {
      if (!filtered.cutoff.includes(d.dateKey)) continue
      byMonth.set(d.dateKey, { date: d.date, count: 0, avgRating: 0, r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 })
    }
    for (const r of filtered.filteredReviews) {
      const slot = byMonth.get(r.dateKey)
      if (!slot) continue
      slot.count += 1
      slot.avgRating += r.rating
      if (r.rating === 1) slot.r1++
      if (r.rating === 2) slot.r2++
      if (r.rating === 3) slot.r3++
      if (r.rating === 4) slot.r4++
      if (r.rating === 5) slot.r5++
    }
    const rows = Array.from(byMonth.values()).map((v) => ({
      name: format(v.date, 'MMM yy'),
      reviews: v.count,
      rating: v.count ? Number((v.avgRating / v.count).toFixed(2)) : 0,
      r1: v.r1, r2: v.r2, r3: v.r3, r4: v.r4, r5: v.r5,
    }))
    return rows
  }, [filtered, dates])

  const ratingDist = useMemo(() => {
    const buckets = [1, 2, 3, 4, 5].map((r) => ({ name: `${r}★`, value: 0 }))
    for (const r of filtered.filteredReviews) {
      buckets[r.rating - 1].value += 1
    }
    return buckets
  }, [filtered])

  const themeTop = useMemo(() => {
    const themeMap = new Map<string, number>()
    for (const r of filtered.filteredReviews) {
      for (const t of r.themeIds) {
        themeMap.set(t, (themeMap.get(t) || 0) + 1)
      }
    }
    const top = Array.from(themeMap.entries())
      .map(([themeId, count]) => ({ name: themes.find((t) => t.themeId === themeId)?.name || themeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    return top
  }, [filtered, themes])

  const smallMultiples = useMemo(()=>{
    return categories.map(cat=>{
      const catBrands = brands.filter(b=>b.categoryId===cat.categoryId)
      const brandIds = new Set(catBrands.map(b=>b.brandId))
      const productIds = new Set(products.filter(p=>brandIds.has(p.brandId)).map(p=>p.productId))
      const revs = reviews.filter(r=>filtered.cutoff.includes(r.dateKey) && productIds.has(r.productId))
      const byMonth = new Map<string, { date: Date; count: number; avg: number }>()
      for (const d of dates) {
        if (!filtered.cutoff.includes(d.dateKey)) continue
        byMonth.set(d.dateKey, { date: d.date, count: 0, avg: 0 })
      }
      for (const r of revs){
        const slot = byMonth.get(r.dateKey); if (!slot) continue
        slot.count++; slot.avg += r.rating
      }
      const rows = Array.from(byMonth.values()).map(v=>({ name: format(v.date,'MMM'), value: v.count? Number((v.avg/v.count).toFixed(2)) : 0 }))
      return { name: cat.name, data: rows }
    })
  }, [categories, brands, products, reviews, filtered.cutoff, dates])

  const handleThemeBarClick = (name: string) => {
    const brand = brands.find(b=>b.name===name)
    if (brand) setSelectedBrandId(brand.brandId)
  }

  const resetBrandOnCategoryChange = (categoryId: string | 'all') => {
    setSelectedCategoryId(categoryId)
    setSelectedBrandId('all')
  }

  const kpiSparkline = useMemo(()=> trendData.map(d=>({ name: d.name, value: d.rating })), [trendData])

  const trendCardId = useId().toString()
  const ratingCardId = useId().toString()
  const themeCardId = useId().toString()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur border border-slate-200 shadow-soft">
        <FilterBar
          categories={categories}
          brands={brands}
          retailers={retailers}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={resetBrandOnCategoryChange}
          selectedBrandId={selectedBrandId}
          setSelectedBrandId={setSelectedBrandId}
          selectedRetailerId={selectedRetailerId}
          setSelectedRetailerId={setSelectedRetailerId}
          months={months}
          setMonths={setMonths}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStat
          icon={<Star className="h-5 w-5 text-amber-500" />}
          label="Avg Rating"
          value={<div className="flex items-center gap-3"><span>{kpis.avgRating.toFixed(2)}</span><Sparkline data={kpiSparkline} color="#f59e0b"/></div> as any}
          delta={kpis.delta}
        />
        <KPIStat
          icon={<MessageSquare className="h-5 w-5 text-brand-600" />}
          label="Reviews"
          value={kpis.count.toLocaleString()}
        />
        <KPIStat
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          label="Sentiment"
          value={(kpis.avgSent * 100).toFixed(0) + '%'}
        />
        <KPIStat
          icon={<ArrowUpRight className="h-5 w-5 text-accentPurple" />}
          label="Last 12 mo Trend"
          value={trendData.length ? `${trendData[0].rating.toFixed(1)}→${trendData.at(-1)?.rating.toFixed(1)}` : '—'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AnimateCard className="p-4 xl:col-span-2" >
          <div id={trendCardId} className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Monthly Trend</h3>
            <ExportButton targetId={trendCardId} filename="monthly-trend.png" />
          </div>
          <LineChartViz data={trendData} yLeftKey="reviews" yRightKey="rating" />
        </AnimateCard>
        <AnimateCard className="p-4">
          <div id={ratingCardId} className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Rating Distribution</h3>
            <ExportButton targetId={ratingCardId} filename="rating-distribution.png" />
          </div>
          <BarChartViz data={ratingDist} xKey="name" barKey="value" color="#f59e0b" />
        </AnimateCard>
      </div>

      <AnimateCard className="p-4">
        <div id={themeCardId} className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Top Themes</h3>
          <ExportButton targetId={themeCardId} filename="top-themes.png" />
        </div>
        <BarChartViz data={themeTop} xKey="name" barKey="count" color="#7c3aed" />
      </AnimateCard>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-2">Rating Mix Shift</h3>
        <StackedRatingArea data={trendData} />
      </AnimateCard>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-2">Small Multiples: Avg Rating by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {smallMultiples.map(sm=> (
            <div key={sm.name} className="rounded-lg border p-2">
              <div className="text-xs text-slate-600 mb-1">{sm.name}</div>
              <Sparkline data={sm.data} dataKey="value" color="#6366f1" />
            </div>
          ))}
        </div>
      </AnimateCard>
    </div>
  )
}