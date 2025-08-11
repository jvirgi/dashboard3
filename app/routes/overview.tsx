"use client"

import { useMemo, useState, useId, useEffect } from 'react'
import { format } from 'date-fns'
import { useSampleData } from '@/lib/useSampleData'
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
import { ReviewsModal } from '@/components/ReviewsModal'

export default function OverviewPage() {
  const data = useSampleData()
  const search = useSearchParams()
  const loading = !data
  const safe = data || { categories: [], brands: [], products: [], retailers: [], dates: [], reviews: [], themes: [] }
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [selectedRetailerIds, setSelectedRetailerIds] = useState<string[]>([])
  const [months, setMonths] = useState<number>(12)
  const [granularity, setGranularity] = useState<Granularity>('month')
  const [isPending, startTransition] = useTransition()
  const [range, setRange] = useState<[number, number]>([0, 100])
  const [timeframe, setTimeframe] = useState<TimeframeValue>({ mode: 'preset', months: 12 })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [ratingRange, setRatingRange] = useState<[number, number]>([1,5])
  const [productQuery, setProductQuery] = useState(decodeURIComponent(search.get('q') || ''))
  const [deferredPQ, setDeferredPQ] = useState(productQuery)
  // keep productQuery synced with URL param so Global Search selections apply
  useEffect(()=>{
    setProductQuery(decodeURIComponent(search.get('q') || ''))
    setDeferredPQ(decodeURIComponent(search.get('q') || ''))
  }, [search])
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])

  useEffect(()=>{
    const id = setTimeout(()=> setDeferredPQ(productQuery), 150)
    return ()=> clearTimeout(id)
  }, [productQuery])

  const { categories, brands, products, retailers, dates, reviews, themes } = safe as any

  // fast lookup maps to avoid repeated linear scans
  const productById = useMemo(()=> new Map(products.map((p:any)=>[p.productId, p])), [products])
  const brandById = useMemo(()=> new Map(brands.map((b:any)=>[b.brandId, b])), [brands])
  const reviewsByDateKey = useMemo(()=>{
    const m = new Map<string, typeof reviews>()
    for (const d of dates) m.set(d.dateKey, [])
    for (const r of reviews){
      const arr = m.get(r.dateKey)
      if (arr) arr.push(r)
    }
    return m
  }, [reviews, dates])

  const allAttributes = useMemo(()=> Array.from(new Set(products.flatMap((p:any)=>p.attributes))).map(a=>({ value:String(a), label:String(a) })), [products])

  const categoryOptions: MultiOption[] = categories.map((c:any)=>({ value: c.categoryId, label: c.name }))
  const brandOptions: MultiOption[] = brands.map((b:any)=>({ value: b.brandId, label: b.name, group: categories.find((c:any)=>c.categoryId===b.categoryId)?.name }))
  const retailerOptions: MultiOption[] = retailers.map((r:any)=>({ value: r.retailerId, label: r.name }))

  const regionOptions = [{value:'NA',label:'North America'},{value:'EU',label:'Europe'},{value:'APAC',label:'APAC'},{value:'LATAM',label:'LATAM'}]
  const themeOptions = themes.map((t:any)=>({ value: t.themeId, label: t.name }))

  const cutoffKeys = useMemo(() => {
    const sorted = [...dates].sort((a:any,b:any)=>a.date.getTime()-b.date.getTime())
    if (timeframe.mode==='preset') {
      return sorted.slice(-timeframe.months).map((d:any)=>d.dateKey)
    } else {
      const startIdx = sorted.findIndex((d:any)=>d.dateKey===timeframe.startKey)
      const endIdx = sorted.findIndex((d:any)=>d.dateKey===timeframe.endKey)
      if (startIdx === -1 || endIdx === -1) return sorted.slice(-12).map((d:any)=>d.dateKey)
      const [s,e] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
      return sorted.slice(s, e+1).map((d:any)=>d.dateKey)
    }
  }, [dates, timeframe])

  // Pre-slice to only the months in range; drastically reduces filtering cost
  const monthlyPool = useMemo(()=>{
    const out: typeof reviews = [] as any
    for (const key of cutoffKeys){
      const arr = reviewsByDateKey.get(key)
      if (arr && arr.length) out.push(...arr)
    }
    return out
  }, [reviewsByDateKey, cutoffKeys])

  const filtered = useMemo(() => {
    const brandIdsInCategory = selectedCategoryIds.length === 0
      ? null
      : new Set(brands.filter((b:any) => selectedCategoryIds.includes(b.categoryId)).map((b:any) => b.brandId))

    const brandFilterSet = selectedBrandIds.length === 0 ? null : new Set(selectedBrandIds)
    const retailerSet = selectedRetailerIds.length === 0 ? null : new Set(selectedRetailerIds)
    const regionSet = selectedRegions.length === 0 ? null : new Set(selectedRegions)
    const themeSet = selectedThemes.length === 0 ? null : new Set(selectedThemes)
    const attrSet = selectedAttributes.length === 0 ? null : new Set(selectedAttributes)
    const pq = deferredPQ.trim().toLowerCase()

    const filteredReviews = monthlyPool.filter((r:any) => {
      // product and brand checks
      const p = productById.get(r.productId) as any
      if (!p) return false
      if (brandIdsInCategory) {
        const pb = brandById.get(p.brandId) as any; if (!pb || !brandIdsInCategory.has(pb.brandId)) return false
      }
      if (brandFilterSet && !brandFilterSet.has(p.brandId)) return false
      if (retailerSet && !retailerSet.has(r.retailerId)) return false
      if (regionSet && !regionSet.has(r.region)) return false
      if (r.rating < ratingRange[0] || r.rating > ratingRange[1]) return false
      if (themeSet && !r.themeIds.some((t:any)=>themeSet.has(t))) return false
      if (pq && !p.name.toLowerCase().includes(pq)) return false
      if (attrSet && !p.attributes.some((a:any)=>attrSet.has(a))) return false
      return true
    })

    return { filteredReviews, cutoff: cutoffKeys }
  }, [monthlyPool, brands, productById, brandById, cutoffKeys, selectedCategoryIds, selectedBrandIds, selectedRetailerIds, selectedRegions, selectedThemes, ratingRange, productQuery, selectedAttributes])

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
    const avgRating = count === 0 ? 0 : filtered.filteredReviews.reduce((s: number, r: any) => s + r.rating, 0) / count
    const avgSent = count === 0 ? 0 : filtered.filteredReviews.reduce((s: number, r: any) => s + r.sentimentScore, 0) / count

    const last3 = filtered.filteredReviews.filter((r: any) => filtered.cutoff.slice(-3).includes(r.dateKey))
    const prev3 = filtered.filteredReviews.filter((r: any) => filtered.cutoff.slice(-6, -3).includes(r.dateKey))
    const last3Avg = last3.length ? last3.reduce((s: number, r: any) => s + r.rating, 0) / last3.length : 0
    const prev3Avg = prev3.length ? prev3.reduce((s: number, r: any) => s + r.rating, 0) / prev3.length : 0
    const delta = last3Avg - prev3Avg

    const last3Sent = last3.length ? last3.reduce((s:number,r:any)=>s+r.sentimentScore,0)/last3.length : 0
    const prev3Sent = prev3.length ? prev3.reduce((s:number,r:any)=>s+r.sentimentScore,0)/prev3.length : 0
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

    const consideredDates = dates.filter((d:any)=>filtered.cutoff.includes(d.dateKey)).map((d:any)=>d.date)

    // seed buckets based on selected months range and granularity
    for (const d of consideredDates) {
      const k = keyFor(d)
      map.set(k.key, { key: k.key, label: k.label, date: d, count: 0, avgRating: 0, r1:0,r2:0,r3:0,r4:0,r5:0 })
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
      .map(([themeId, count]) => ({ name: themes.find((t:any) => t.themeId === themeId)?.name || themeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    return top
  }, [filtered, themes])

  const smallMultiples = useMemo(()=>{
    // compute from monthly pool to avoid scanning full dataset
    const byCat = new Map<string, Map<string, { date: Date; count: number; sum: number }>>()
    for (const d of dates) {
      if (!cutoffKeys.includes(d.dateKey)) continue
      for (const c of categories){
        if (!byCat.has((c as any).categoryId)) byCat.set((c as any).categoryId, new Map())
        byCat.get((c as any).categoryId)!.set(d.dateKey, { date: d.date, count: 0, sum: 0 })
      }
    }
    for (const r of filtered.filteredReviews){
      const p = productById.get(r.productId) as any; if (!p) continue
      const b = brandById.get(p.brandId) as any; if (!b) continue
      const slot = byCat.get(b.categoryId)?.get(r.dateKey); if (!slot) continue
      slot.count++; slot.sum += r.rating
    }
    return categories.map((cat:any)=>{
      const rows = Array.from(byCat.get(cat.categoryId)?.values() || [])
        .map(v=>({ name: format(v.date,'MMM'), value: v.count? Number((v.sum/v.count).toFixed(2)) : 0 }))
      return { name: cat.name, data: rows }
    })
  }, [categories, productById, brandById, filtered.filteredReviews, dates, cutoffKeys])

  const trendCardId = useId()
  const ratingCardId = useId()
  const themeCardId = useId()

  const kpiSparkline = useMemo(()=>{
    const arr = slicedTrend.map(d=>({ name: d.name, value: d.rating }))
    return arr.length ? arr : Array.from({length:8}).map((_,i)=>({ name: String(i), value: 0 }))
  }, [slicedTrend])

  const handleThemeBarClick = (name: string) => {
    const brand = (brands as any).find((b:any)=>b.name===name)
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

  const pending = isPending || loading

  return (
    <div className="space-y-6">
      {loading && (
        <>
          <div className="rounded-2xl p-6 bg-white/60 backdrop-blur border border-slate-200 shadow-soft">
            <div className="h-8 skeleton" />
          </div>
        </>
      )}
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur border border-slate-200 shadow-soft">
        <div className="flex flex-wrap items-end gap-4">
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
          <button onClick={()=>setDrawerOpen(true)} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">More filters</button>
        </div>
        <div className="mt-3">
          <ActiveFilterChips chips={activeChips} onRemove={(key)=>{
            startTransition(()=>{
              if (key==='cat') setSelectedCategoryIds([])
              if (key==='brand') setSelectedBrandIds([])
              if (key==='ret') setSelectedRetailerIds([])
              if (key==='reg') setSelectedRegions([])
              if (key==='th') setSelectedThemes([])
              if (key==='rat') setRatingRange([1,5])
              if (key==='pq') setProductQuery('')
              if (key==='attr') setSelectedAttributes([])
            })
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
        onReset={()=> startTransition(()=>{ setSelectedRegions([]); setSelectedThemes([]); setRatingRange([1,5]); setProductQuery(''); setSelectedAttributes([]) })}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pending ? (
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
          <div id={trendCardId} className="flex items-center justify-between mb-2" onContextMenu={(e)=>{ e.preventDefault(); setReviewsOpen(true) }}>
            <h3 className="font-semibold">Monthly Trend</h3>
            <div className="flex items-center gap-2">
              <TimeGranularity value={granularity} onChange={(g)=> startTransition(()=> setGranularity(g))} />
              <ExportButton targetId={trendCardId} filename="monthly-trend.png" />
            </div>
          </div>
          {pending ? <Skeleton className="h-72" /> : <LineChartViz data={slicedTrend} yLeftKey="reviews" yRightKey="rating" showBrush={false} />}
          <div className="mt-2">
            <RangeSlider min={0} max={100} value={range} onChange={setRange} />
          </div>
        </AnimateCard>
        <AnimateCard className="p-4">
          <div id={ratingCardId} className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Rating Distribution</h3>
            <ExportButton targetId={ratingCardId} filename="rating-distribution.png" />
          </div>
          {pending ? <Skeleton className="h-72" /> : (
            <div onContextMenu={(e)=>{ e.preventDefault(); setReviewsOpen(true) }}>
              <BarChartViz data={ratingDist} xKey="name" barKey="value" color="#f59e0b" />
            </div>
          )}
        </AnimateCard>
      </div>

      <AnimateCard className="p-4">
        <div id={themeCardId} className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Top Themes</h3>
          <ExportButton targetId={themeCardId} filename="top-themes.png" />
        </div>
        {pending ? <Skeleton className="h-72" /> : (
          <div onContextMenu={(e)=>{ e.preventDefault(); setReviewsOpen(true) }}>
            <BarChartViz data={themeTop} xKey="name" barKey="count" color="#7c3aed" onBarClick={(name)=>{
              const b = (brands as any).find((br:any)=>br.name===name); if (b) setSelectedBrandIds([b.brandId])
            }} />
          </div>
        )}
      </AnimateCard>

      <AnimateCard className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold mb-2">Rating Mix Shift</h3>
        </div>
        {pending ? <Skeleton className="h-72" /> : (
          <div onContextMenu={(e)=>{ e.preventDefault(); setReviewsOpen(true) }}>
            <StackedRatingArea data={slicedTrend} showBrush={false} />
          </div>
        )}
        <div className="mt-2">
          <RangeSlider min={0} max={100} value={range} onChange={setRange} />
        </div>
      </AnimateCard>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-2">Small Multiples: Avg Rating by Category</h3>
        {pending ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i)=>(<Skeleton key={i} className="h-16"/>))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {smallMultiples.map((sm:any)=> (
              <div key={sm.name} className="rounded-lg border p-2">
                <div className="text-xs text-slate-600 mb-1">{sm.name}</div>
                <Sparkline data={sm.data} dataKey="value" color="#6366f1" />
              </div>
            ))}
          </div>
        )}
      </AnimateCard>
      <ReviewsModal
        open={reviewsOpen}
        onOpenChange={setReviewsOpen}
        reviews={filtered.filteredReviews}
        brands={brands}
        products={products}
        retailers={retailers}
        themes={themes}
        categories={categories}
      />
    </div>
  )
}