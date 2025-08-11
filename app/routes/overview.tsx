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
import { Skeleton } from '@/components/Skeleton'
import { useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { TimeGranularity, Granularity } from '@/components/TimeGranularity'
import { MultiSelectCombobox, MultiOption } from '@/components/MultiSelectCombobox'
import { RangeSlider } from '@/components/charts/RangeSlider'
import { TimeframeControl, TimeframeValue } from '@/components/TimeframeControl'
import { FiltersDrawer } from '@/components/FiltersDrawer'
import { ActiveFilterChips } from '@/components/ActiveFilterChips'

export default function OverviewPage() {
  const data = sampleData
  const search = useSearchParams()
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [selectedRetailerIds, setSelectedRetailerIds] = useState<string[]>([])
  const [months, setMonths] = useState<number>(12)
  const [granularity, setGranularity] = useState<Granularity>('month')
  const [isPending, startTransition] = useTransition()
  const [range, setRange] = useState<[number, number]>([0, 100])
  const [timeframe, setTimeframe] = useState<TimeframeValue>({ mode: 'preset', months: 12 })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [ratingRange, setRatingRange] = useState<[number, number]>([1,5])
  const [productQuery, setProductQuery] = useState('')
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])

  const { categories, brands, products, retailers, dates, reviews, themes } = data
  const allAttributes = useMemo(()=> Array.from(new Set(products.flatMap(p=>p.attributes))).map(a=>({ value:a, label:a })), [products])

  const categoryOptions: MultiOption[] = categories.map(c=>({ value: c.categoryId, label: c.name }))
  const brandOptions: MultiOption[] = brands.map(b=>({ value: b.brandId, label: b.name, group: categories.find(c=>c.categoryId===b.categoryId)?.name }))
  const retailerOptions: MultiOption[] = retailers.map(r=>({ value: r.retailerId, label: r.name }))

  const regionOptions = [{value:'NA',label:'North America'},{value:'EU',label:'Europe'},{value:'APAC',label:'APAC'},{value:'LATAM',label:'LATAM'}]
  const themeOptions = themes.map(t=>({ value: t.themeId, label: t.name }))

  const cutoffKeys = useMemo(() => {
    const sorted = [...dates].sort((a,b)=>a.date.getTime()-b.date.getTime())
    if (timeframe.mode==='preset') {
      return sorted.slice(-timeframe.months).map(d=>d.dateKey)
    } else {
      const startIdx = sorted.findIndex(d=>d.dateKey===timeframe.startKey)
      const endIdx = sorted.findIndex(d=>d.dateKey===timeframe.endKey)
      if (startIdx === -1 || endIdx === -1) return sorted.slice(-12).map(d=>d.dateKey)
      const [s,e] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
      return sorted.slice(s, e+1).map(d=>d.dateKey)
    }
  }, [dates, timeframe])

  const filtered = useMemo(() => {
    const cutoff = cutoffKeys

    const brandIdsInCategory = selectedCategoryIds.length === 0
      ? new Set(brands.map((b) => b.brandId))
      : new Set(brands.filter((b) => selectedCategoryIds.includes(b.categoryId)).map((b) => b.brandId))

    const productIdsInBrand = selectedBrandIds.length === 0
      ? new Set(products.filter((p) => brandIdsInCategory.has(p.brandId)).map((p) => p.productId))
      : new Set(products.filter((p) => selectedBrandIds.includes(p.brandId)).map((p) => p.productId))

    const retailerSet = selectedRetailerIds.length === 0 ? null : new Set(selectedRetailerIds)
    const regionSet = selectedRegions.length === 0 ? null : new Set(selectedRegions)
    const themeSet = selectedThemes.length === 0 ? null : new Set(selectedThemes)
    const attrSet = selectedAttributes.length === 0 ? null : new Set(selectedAttributes)

    const filteredReviews = reviews.filter((r) =>
      cutoff.includes(r.dateKey) &&
      productIdsInBrand.has(r.productId) &&
      (!retailerSet || retailerSet.has(r.retailerId)) &&
      (!regionSet || regionSet.has(r.region)) &&
      (r.rating >= ratingRange[0] && r.rating <= ratingRange[1]) &&
      (!themeSet || r.themeIds.some(t=>themeSet.has(t))) &&
      (productQuery ? products.find(p=>p.productId===r.productId)?.name.toLowerCase().includes(productQuery.toLowerCase()) : true) &&
      (!attrSet || products.find(p=>p.productId===r.productId)?.attributes.some(a=>attrSet.has(a)))
    )

    return { filteredReviews, cutoff }
  }, [reviews, brands, products, cutoffKeys, selectedCategoryIds, selectedBrandIds, selectedRetailerIds, selectedRegions, selectedThemes, ratingRange, productQuery, selectedAttributes])

  const activeChips = useMemo(()=>{
    const chips: Array<{key:string; label:string}> = []
    if (selectedCategoryIds.length) chips.push({ key:'cat', label:`${selectedCategoryIds.length} categories` })
    if (selectedBrandIds.length) chips.push({ key:'brand', label:`${selectedBrandIds.length} brands` })
    if (selectedRetailerIds.length) chips.push({ key:'ret', label:`${selectedRetailerIds.length} retailers` })
    if (selectedRegions.length) chips.push({ key:'reg', label:`${selectedRegions.join(',')}` })
    if (selectedThemes.length) chips.push({ key:'th', label:`${selectedThemes.length} themes` })
    if (ratingRange[0]!==1 || ratingRange[1]!==5) chips.push({ key:'rat', label:`${ratingRange[0]}★–${ratingRange[1]}★` })
    if (productQuery) chips.push({ key:'pq', label:`Product: ${productQuery}` })
    if (selectedAttributes.length) chips.push({ key:'attr', label:`${selectedAttributes.length} attributes` })
    return chips
  }, [selectedCategoryIds, selectedBrandIds, selectedRetailerIds, selectedRegions, selectedThemes, ratingRange, productQuery, selectedAttributes])

  const kpis = useMemo(() => {
    const count = filtered.filteredReviews.length
    const avgRating = count === 0 ? 0 : filtered.filteredReviews.reduce((s, r) => s + r.rating, 0) / count
    const avgSent = count === 0 ? 0 : filtered.filteredReviews.reduce((s, r) => s + r.sentimentScore, 0) / count

    const last3 = filtered.filteredReviews.filter((r) => filtered.cutoff.slice(-3).includes(r.dateKey))
    const prev3 = filtered.filteredReviews.filter((r) => filtered.cutoff.slice(-6, -3).includes(r.dateKey))
    const last3Avg = last3.length ? last3.reduce((s, r) => s + r.rating, 0) / last3.length : 0
    const prev3Avg = prev3.length ? prev3.reduce((s, r) => s + r.rating, 0) / prev3.length : 0
    const delta = last3Avg - prev3Avg

    const last3Sent = last3.length ? last3.reduce((s,r)=>s+r.sentimentScore,0)/last3.length : 0
    const prev3Sent = prev3.length ? prev3.reduce((s,r)=>s+r.sentimentScore,0)/prev3.length : 0
    const deltaSent = last3Sent - prev3Sent

    const last3Count = last3.length
    const prev3Count = prev3.length || 1
    const deltaVol = (last3Count - prev3Count) / prev3Count

    return { count, avgRating, avgSent, delta, deltaSent, deltaVol }
  }, [filtered])

  const trendData = useMemo(() => {
    const map = new Map<string, { key: string; label: string; date: Date; count: number; avgRating: number; r1: number; r2: number; r3: number; r4: number; r5: number }>()
    function keyFor(date: Date){
      if (granularity==='day') return { key: date.toISOString().slice(0,10), label: date.toLocaleDateString(undefined,{ month:'short', day:'numeric'}) }
      if (granularity==='quarter') {
        const q = Math.floor(date.getMonth()/3)+1
        return { key: `${date.getFullYear()}-Q${q}`, label: `Q${q} ${String(date.getFullYear()).slice(-2)}` }
      }
      if (granularity==='year') return { key: String(date.getFullYear()), label: String(date.getFullYear()) }
      return { key: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`, label: date.toLocaleDateString(undefined,{ month:'short', year:'2-digit'}) }
    }

    const consideredDates = dates.filter(d=>filtered.cutoff.includes(d.dateKey)).map(d=>d.date)

    // seed buckets based on selected months range and granularity
    for (const d of consideredDates) {
      const k = keyFor(d)
      map.set(k.key, { key: k.key, label: k.label, date: d, count: 0, avgRating: 0, r1:0,r2:0,r3:0,r4:0,r5:0 })
      if (granularity==='day'){
        // seed all days in month range roughly: skip for simplicity, will be filled by reviews
      }
    }

    for (const r of filtered.filteredReviews) {
      const date = r.reviewDate
      const k = keyFor(date)
      if (!map.has(k.key)) map.set(k.key, { key: k.key, label: k.label, date, count: 0, avgRating: 0, r1:0,r2:0,r3:0,r4:0,r5:0 })
      const slot = map.get(k.key)!
      slot.count += 1
      slot.avgRating += r.rating
      if (r.rating === 1) slot.r1++
      if (r.rating === 2) slot.r2++
      if (r.rating === 3) slot.r3++
      if (r.rating === 4) slot.r4++
      if (r.rating === 5) slot.r5++
    }

    const rows = Array.from(map.values())
      .sort((a,b)=>a.date.getTime()-b.date.getTime())
      .map((v) => ({
        name: v.label,
        reviews: v.count,
        rating: v.count ? Number((v.avgRating / v.count).toFixed(2)) : 0,
        r1: v.r1, r2: v.r2, r3: v.r3, r4: v.r4, r5: v.r5,
      }))
    return rows
  }, [filtered, dates, granularity])

  const slicedTrend = useMemo(()=>{
    if (trendData.length === 0) return [] as typeof trendData
    const startIdx = Math.floor((range[0]/100) * trendData.length)
    const endIdx = Math.ceil((range[1]/100) * trendData.length)
    return trendData.slice(startIdx, endIdx)
  }, [trendData, range])

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
    if (brand) setSelectedBrandIds([brand.brandId])
  }

  const resetBrandOnCategoryChange = (categoryId: string | 'all') => {
    startTransition(()=>{
      setSelectedCategoryIds(categoryId === 'all' ? [] : [categoryId])
      setSelectedBrandIds([])
    })
  }

  const onSetBrand = (v: string[] | 'all') => startTransition(()=>setSelectedBrandIds(v === 'all' ? [] : v))
  const onSetRetailer = (v: string[] | 'all') => startTransition(()=>setSelectedRetailerIds(v === 'all' ? [] : v))
  const onSetMonths = (n: number) => startTransition(()=>setMonths(n))

  const kpiSparkline = useMemo(()=> trendData.map(d=>({ name: d.name, value: d.rating })), [trendData])

  const trendCardId = useId().toString()
  const ratingCardId = useId().toString()
  const themeCardId = useId().toString()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Timeframe</label>
              <TimeframeControl dates={dates} value={timeframe} onChange={(v)=> startTransition(()=> setTimeframe(v))} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Categories</label>
              <MultiSelectCombobox values={selectedCategoryIds} onChange={(vals)=>startTransition(()=>setSelectedCategoryIds(vals))} options={categoryOptions} placeholder="All Categories" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Brands</label>
              <MultiSelectCombobox values={selectedBrandIds} onChange={(vals)=>startTransition(()=>setSelectedBrandIds(vals))} options={brandOptions} placeholder="All Brands" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Retailers</label>
              <MultiSelectCombobox values={selectedRetailerIds} onChange={(vals)=>startTransition(()=>setSelectedRetailerIds(vals))} options={retailerOptions} placeholder="All Retailers" />
            </div>
          </div>
          <button onClick={()=>setDrawerOpen(true)} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">More filters</button>
        </div>
        <div className="mt-3">
          <ActiveFilterChips chips={activeChips} onRemove={(key)=>{
            if (key==='cat') setSelectedCategoryIds([])
            if (key==='brand') setSelectedBrandIds([])
            if (key==='ret') setSelectedRetailerIds([])
            if (key==='reg') setSelectedRegions([])
            if (key==='th') setSelectedThemes([])
            if (key==='rat') setRatingRange([1,5])
            if (key==='pq') setProductQuery('')
            if (key==='attr') setSelectedAttributes([])
          }} />
        </div>
      </div>

      <FiltersDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        sections={[
          { title: 'Geography', content: (
            <MultiSelectCombobox values={selectedRegions} onChange={setSelectedRegions} options={regionOptions} placeholder="All Regions" />
          )},
          { title: 'Themes', content: (
            <MultiSelectCombobox values={selectedThemes} onChange={setSelectedThemes} options={themeOptions} placeholder="All Themes" />
          )},
          { title: 'Star Rating', content: (
            <div className="flex items-center gap-3">
              <label className="text-sm">From</label>
              <input type="number" min={1} max={5} value={ratingRange[0]} onChange={(e)=>setRatingRange([Number(e.target.value), ratingRange[1]])} className="w-20 border rounded px-2 py-1" />
              <label className="text-sm">To</label>
              <input type="number" min={1} max={5} value={ratingRange[1]} onChange={(e)=>setRatingRange([ratingRange[0], Number(e.target.value)])} className="w-20 border rounded px-2 py-1" />
            </div>
          )},
          { title: 'Product Name', content: (
            <input type="text" placeholder="Search product name" value={productQuery} onChange={(e)=>setProductQuery(e.target.value)} className="w-full border rounded px-3 py-2" />
          )},
          { title: 'Attributes', content: (
            <MultiSelectCombobox values={selectedAttributes} onChange={setSelectedAttributes} options={allAttributes} placeholder="All Attributes" />
          )}
        ]}
        onApply={()=> setDrawerOpen(false)}
        onReset={()=>{ setSelectedRegions([]); setSelectedThemes([]); setRatingRange([1,5]); setProductQuery(''); setSelectedAttributes([]) }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isPending ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <KPIStat
              icon={<Star className="h-5 w-5 text-amber-500" />}
              label="Avg Rating"
              value={<div className="flex items-center gap-3"><span>{kpis.avgRating.toFixed(2)}</span><Sparkline data={kpiSparkline} color="#f59e0b"/></div> as any}
              delta={kpis.delta}
            />
            <KPIStat
              icon={<MessageSquare className="h-5 w-5 text-brand-600" />}
              label="Reviews"
              value={kpis.count}
              delta={Number((kpis.deltaVol*100).toFixed(1))}
              suffix="%"
            />
            <KPIStat
              icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
              label="Sentiment"
              value={Number((kpis.avgSent * 100).toFixed(0))}
              suffix="%"
              delta={Number((kpis.deltaSent*100).toFixed(1))}
            />
            <KPIStat
              icon={<ArrowUpRight className="h-5 w-5 text-accentPurple" />}
              label="Last 12 mo Trend"
              value={trendData.length ? `${trendData[0].rating.toFixed(1)}→${trendData.at(-1)?.rating.toFixed(1)}` : '—'}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AnimateCard className="p-4 xl:col-span-2" >
          <div id={trendCardId} className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Monthly Trend</h3>
            <div className="flex items-center gap-2">
              <TimeGranularity value={granularity} onChange={(g)=> startTransition(()=> setGranularity(g))} />
              <ExportButton targetId={trendCardId} filename="monthly-trend.png" />
            </div>
          </div>
          {isPending ? <Skeleton className="h-72" /> : <LineChartViz data={slicedTrend} yLeftKey="reviews" yRightKey="rating" showBrush={false} />}
          <div className="mt-2">
            <RangeSlider min={0} max={100} value={range} onChange={setRange} />
          </div>
        </AnimateCard>
        <AnimateCard className="p-4">
          <div id={ratingCardId} className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Rating Distribution</h3>
            <ExportButton targetId={ratingCardId} filename="rating-distribution.png" />
          </div>
          {isPending ? <Skeleton className="h-72" /> : <BarChartViz data={ratingDist} xKey="name" barKey="value" color="#f59e0b" />}
        </AnimateCard>
      </div>

      <AnimateCard className="p-4">
        <div id={themeCardId} className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Top Themes</h3>
          <ExportButton targetId={themeCardId} filename="top-themes.png" />
        </div>
        {isPending ? <Skeleton className="h-72" /> : <BarChartViz data={themeTop} xKey="name" barKey="count" color="#7c3aed" onBarClick={(name)=>{
          const b = brands.find(br=>br.name===name); if (b) setSelectedBrandIds([b.brandId])
        }} />}
      </AnimateCard>

      <AnimateCard className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold mb-2">Rating Mix Shift</h3>
        </div>
        {isPending ? <Skeleton className="h-72" /> : <StackedRatingArea data={slicedTrend} showBrush={false} />}
        <div className="mt-2">
          <RangeSlider min={0} max={100} value={range} onChange={setRange} />
        </div>
      </AnimateCard>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-2">Small Multiples: Avg Rating by Category</h3>
        {isPending ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i)=>(<Skeleton key={i} className="h-16"/>))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {smallMultiples.map(sm=> (
              <div key={sm.name} className="rounded-lg border p-2">
                <div className="text-xs text-slate-600 mb-1">{sm.name}</div>
                <Sparkline data={sm.data} dataKey="value" color="#6366f1" />
              </div>
            ))}
          </div>
        )}
      </AnimateCard>
    </div>
  )
}