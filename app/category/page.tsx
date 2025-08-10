"use client"

import { useMemo, useState } from 'react'
import { sampleData } from '@/lib/sampleData'
import { FilterBar } from '@/components/FilterBar'
import { BarChartViz } from '@/components/charts/BarChartViz'
import { AnimateCard } from '@/components/AnimateCard'
import { RadarChartViz } from '@/components/charts/RadarChartViz'
import { TreemapViz } from '@/components/charts/TreemapViz'

export default function CategoryBrandPage() {
  const data = sampleData
  const { categories, brands, products, dates, reviews, retailers, themes } = data

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all')
  const [selectedBrandId, setSelectedBrandId] = useState<string | 'all'>('all')
  const [months, setMonths] = useState<number>(12)

  const cutoff = useMemo(() => dates.sort((a,b)=>a.date.getTime()-b.date.getTime()).slice(-months).map(d=>d.dateKey), [dates, months])

  const filteredReviews = useMemo(() => {
    const brandIds = selectedCategoryId === 'all' ? new Set(brands.map(b=>b.brandId)) : new Set(brands.filter(b=>b.categoryId===selectedCategoryId).map(b=>b.brandId))
    const productIds = selectedBrandId === 'all' ? new Set(products.filter(p=>brandIds.has(p.brandId)).map(p=>p.productId)) : new Set(products.filter(p=>p.brandId===selectedBrandId).map(p=>p.productId))
    return reviews.filter(r=>cutoff.includes(r.dateKey) && productIds.has(r.productId))
  }, [reviews, brands, products, cutoff, selectedCategoryId, selectedBrandId])

  const byCategory = useMemo(()=>{
    const map = new Map<string, {name:string, avg:number, count:number}>()
    for (const c of categories) map.set(c.categoryId, {name:c.name, avg:0, count:0})
    for (const r of filteredReviews){
      const brand = brands.find(b=>b.brandId===products.find(p=>p.productId===r.productId)?.brandId)
      if (!brand) continue
      const slot = map.get(brand.categoryId)
      if (!slot) continue
      slot.avg += r.rating
      slot.count += 1
    }
    return Array.from(map.values()).map(v=>({name:v.name, value: v.count? Number((v.avg/v.count).toFixed(2)) : 0}))
  }, [filteredReviews, categories, brands, products])

  const topBrands = useMemo(()=>{
    const map = new Map<string, {name:string, avg:number, count:number}>()
    for (const b of brands) map.set(b.brandId, {name:b.name, avg:0, count:0})
    for (const r of filteredReviews){
      const product = products.find(p=>p.productId===r.productId)
      if (!product) continue
      const slot = map.get(product.brandId)
      if (!slot) continue
      slot.avg += r.rating
      slot.count += 1
    }
    return Array.from(map.entries())
      .map(([id,v])=>({id, name:v.name, avg: v.count? Number((v.avg/v.count).toFixed(2)) : 0, count:v.count}))
      .filter(b=>b.count>0)
      .sort((a,b)=>b.avg-a.avg)
      .slice(0,10)
  }, [filteredReviews, brands, products])

  const themeProfile = useMemo(()=>{
    const counts = new Map<string, number>()
    for (const r of filteredReviews){
      for (const t of r.themeIds){
        counts.set(t, (counts.get(t)||0) + 1)
      }
    }
    return themes.map(t=>({ name: t.name, value: counts.get(t.themeId) || 0 }))
  }, [filteredReviews, themes])

  const composition = useMemo(()=>{
    // brand composition by review counts
    return topBrands.map(b=>({ name: b.name, value: b.count }))
  }, [topBrands])

  const resetBrandOnCategoryChange = (categoryId: string | 'all') => {
    setSelectedCategoryId(categoryId)
    setSelectedBrandId('all')
  }

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
          selectedRetailerId={'all'}
          setSelectedRetailerId={()=>{}}
          months={months}
          setMonths={setMonths}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Avg Rating by Category</h3>
          <BarChartViz data={byCategory} xKey="name" barKey="value" color="#14b8a6" />
        </AnimateCard>
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Top Brands</h3>
          <BarChartViz data={topBrands.map(b=>({name:b.name, value:b.avg}))} xKey="name" barKey="value" color="#3b82f6" />
        </AnimateCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Theme Profile (Radar)</h3>
          <RadarChartViz data={themeProfile} />
        </AnimateCard>
        <AnimateCard className="p-4">
          <h3 className="font-semibold mb-2">Brand Mix (Treemap)</h3>
          <TreemapViz data={composition} />
        </AnimateCard>
      </div>

      <AnimateCard className="p-4">
        <h3 className="font-semibold mb-2">Top Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Brand</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Avg Rating</th>
                <th className="py-2 pr-4">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0,80).map((p)=>{
                const revs = filteredReviews.filter(r=>r.productId===p.productId)
                if (revs.length===0) return null
                const avg = revs.reduce((s,r)=>s+r.rating,0)/revs.length
                const brand = brands.find(b=>b.brandId===p.brandId)!
                const category = categories.find(c=>c.categoryId===brand.categoryId)!
                return (
                  <tr key={p.productId} className="border-t">
                    <td className="py-2 pr-4 font-medium">{p.name}</td>
                    <td className="py-2 pr-4">{brand.name}</td>
                    <td className="py-2 pr-4">{category.name}</td>
                    <td className="py-2 pr-4">{avg.toFixed(2)}</td>
                    <td className="py-2 pr-4">{revs.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </AnimateCard>
    </div>
  )
}