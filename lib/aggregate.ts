import { DataModel, ReviewFact } from '@/lib/types'

export type OverviewFilters = {
  selectedCategoryIds: string[]
  selectedBrandIds: string[]
  selectedRetailerIds: string[]
  selectedRegions: string[]
  selectedThemes: string[]
  ratingRange: [number, number]
  productQuery: string
  selectedAttributes: string[]
  timeframe: { mode: 'preset'; months: number } | { mode: 'range'; startKey: string; endKey: string }
  granularity: 'day' | 'month' | 'quarter' | 'year'
}

export function cutoffKeys(dates: DataModel['dates'], timeframe: OverviewFilters['timeframe']): string[] {
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
}

export function filterReviews(data: DataModel, filters: OverviewFilters): ReviewFact[] {
  const { brands, products, reviews, dates } = data
  const ck = cutoffKeys(dates, filters.timeframe)
  const brandIdsInCategory = filters.selectedCategoryIds.length === 0
    ? null
    : new Set(brands.filter(b => filters.selectedCategoryIds.includes(b.categoryId)).map(b => b.brandId))
  const brandFilterSet = filters.selectedBrandIds.length === 0 ? null : new Set(filters.selectedBrandIds)
  const retailerSet = filters.selectedRetailerIds.length === 0 ? null : new Set(filters.selectedRetailerIds)
  const regionSet = filters.selectedRegions.length === 0 ? null : new Set(filters.selectedRegions)
  const themeSet = filters.selectedThemes.length === 0 ? null : new Set(filters.selectedThemes)
  const attrSet = filters.selectedAttributes.length === 0 ? null : new Set(filters.selectedAttributes)
  const pq = filters.productQuery.trim().toLowerCase()
  const productById = new Map(products.map(p=>[p.productId, p]))
  const brandById = new Map(data.brands.map(b=>[b.brandId, b]))

  return reviews.filter((r) => {
    if (!ck.includes(r.dateKey)) return false
    const p = productById.get(r.productId)
    if (!p) return false
    if (brandIdsInCategory) {
      const pb = brandById.get(p.brandId); if (!pb || !brandIdsInCategory.has(pb.brandId)) return false
    }
    if (brandFilterSet && !brandFilterSet.has(p.brandId)) return false
    if (retailerSet && !retailerSet.has(r.retailerId)) return false
    if (regionSet && !regionSet.has(r.region)) return false
    if (r.rating < filters.ratingRange[0] || r.rating > filters.ratingRange[1]) return false
    if (themeSet && !r.themeIds.some(t=>themeSet.has(t))) return false
    if (pq && !p.name.toLowerCase().includes(pq)) return false
    if (attrSet && !p.attributes.some(a=>attrSet.has(a))) return false
    return true
  })
}

export function aggregateOverview(data: DataModel, filters: OverviewFilters){
  const { dates, themes } = data
  const ck = cutoffKeys(dates, filters.timeframe)
  const fr = filterReviews(data, filters)

  // KPIs
  const count = fr.length
  const avgRating = count === 0 ? 0 : fr.reduce((s,r)=>s+r.rating,0) / count
  const avgSent = count === 0 ? 0 : fr.reduce((s,r)=>s+r.sentimentScore,0) / count
  const last3 = fr.filter(r=> ck.slice(-3).includes(r.dateKey))
  const prev3 = fr.filter(r=> ck.slice(-6, -3).includes(r.dateKey))
  const last3Avg = last3.length ? last3.reduce((s,r)=>s+r.rating,0)/last3.length : 0
  const prev3Avg = prev3.length ? prev3.reduce((s,r)=>s+r.rating,0)/prev3.length : 0
  const delta = last3Avg - prev3Avg
  const last3Sent = last3.length ? last3.reduce((s,r)=>s+r.sentimentScore,0)/last3.length : 0
  const prev3Sent = prev3.length ? prev3.reduce((s,r)=>s+r.sentimentScore,0)/prev3.length : 0
  const deltaSent = last3Sent - prev3Sent
  const last3Count = last3.length
  const prev3Count = prev3.length
  const deltaVolCount = last3Count - prev3Count

  // Trend and ratings mix by selected granularity (support month and quarter/year minimal)
  function keyFor(date: Date){
    if (filters.granularity==='day') return { key: date.toISOString().slice(0,10), label: date.toLocaleDateString(undefined,{ month:'short', day:'numeric'}) }
    if (filters.granularity==='quarter'){
      const q = Math.floor(date.getMonth()/3)+1
      return { key: `${date.getFullYear()}-Q${q}`, label: `Q${q} ${String(date.getFullYear()).slice(-2)}` }
    }
    if (filters.granularity==='year') return { key: String(date.getFullYear()), label: String(date.getFullYear()) }
    return { key: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`, label: date.toLocaleDateString(undefined,{ month:'short', year:'2-digit'}) }
  }
  const consideredDates = dates.filter(d=>ck.includes(d.dateKey)).map(d=>d.date)
  const trendMap = new Map<string, { key:string; label:string; date:Date; count:number; sum:number; r1:number;r2:number;r3:number;r4:number;r5:number }>()
  for (const d of consideredDates){ const k = keyFor(d); trendMap.set(k.key, { key:k.key, label:k.label, date:d, count:0, sum:0, r1:0,r2:0,r3:0,r4:0,r5:0 }) }
  for (const r of fr){
    const k = keyFor(r.reviewDate)
    if (!trendMap.has(k.key)) trendMap.set(k.key, { key:k.key, label:k.label, date:r.reviewDate, count:0, sum:0, r1:0,r2:0,r3:0,r4:0,r5:0 })
    const slot = trendMap.get(k.key)!
    slot.count++
    slot.sum += r.rating
    if (r.rating===1) slot.r1++
    if (r.rating===2) slot.r2++
    if (r.rating===3) slot.r3++
    if (r.rating===4) slot.r4++
    if (r.rating===5) slot.r5++
  }
  const trendData = Array.from(trendMap.values()).sort((a,b)=>a.date.getTime()-b.date.getTime()).map(v=>({ name: v.label, reviews: v.count, rating: v.count? Number((v.sum/v.count).toFixed(2)) : 0, r1:v.r1,r2:v.r2,r3:v.r3,r4:v.r4,r5:v.r5 }))

  // Rating distribution
  const ratingDist = [1,2,3,4,5].map(r=>({ name: `${r}★`, value: 0 }))
  for (const r of fr){ ratingDist[r.rating-1].value++ }

  // Top themes
  const themeMap = new Map<string, number>()
  for (const r of fr){ for (const t of r.themeIds){ themeMap.set(t, (themeMap.get(t)||0)+1) } }
  const themeTop = Array.from(themeMap.entries()).map(([themeId, count])=>({ name: themes.find(t=>t.themeId===themeId)?.name || themeId, count })).sort((a,b)=>b.count-a.count).slice(0,8)

  // Small multiples by category (avg rating by month)
  const byCatMonth = new Map<string, Map<string, { date: Date; count:number; sum:number }>>()
  for (const d of dates){ if (!ck.includes(d.dateKey)) continue; byCatMonth.set(d.dateKey, new Map()) }
  // Build index helpers
  const productById = new Map(data.products.map(p=>[p.productId, p]))
  const brandById = new Map(data.brands.map(b=>[b.brandId, b]))
  for (const r of fr){
    const p = productById.get(r.productId); if (!p) continue
    const b = brandById.get(p.brandId); if (!b) continue
    const key = r.dateKey
    let slot = byCatMonth.get(key)!.get(b.categoryId)
    if (!slot){ slot = { date: new Date(r.dateKey+'-01'), count: 0, sum: 0 }; byCatMonth.get(key)!.set(b.categoryId, slot) }
    slot.count++; slot.sum += r.rating
  }
  const smallMultiples = data.categories.map(cat=>{
    const series = [] as Array<{ name:string; value:number }>
    for (const d of dates){ if (!ck.includes(d.dateKey)) continue; const slot = byCatMonth.get(d.dateKey)?.get(cat.categoryId); series.push({ name: d.date.toLocaleDateString(undefined,{month:'short'}), value: slot && slot.count ? Number((slot.sum/slot.count).toFixed(2)) : 0 }) }
    return { name: cat.name, data: series }
  })

  return { cutoff: ck, kpis: { count, avgRating, avgSent, delta, deltaSent, deltaVolCount }, trendData, ratingDist, themeTop, smallMultiples }
}