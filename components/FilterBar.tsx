"use client"

import { CategoryDim, BrandDim, RetailerDim } from '@/lib/types'

export function FilterBar({
  categories,
  brands,
  retailers,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedBrandId,
  setSelectedBrandId,
  selectedRetailerId,
  setSelectedRetailerId,
  months,
  setMonths
}: {
  categories: CategoryDim[]
  brands: BrandDim[]
  retailers: RetailerDim[]
  selectedCategoryId: string | 'all'
  setSelectedCategoryId: (v: string | 'all') => void
  selectedBrandId: string | 'all'
  setSelectedBrandId: (v: string | 'all') => void
  selectedRetailerId: string | 'all'
  setSelectedRetailerId: (v: string | 'all') => void
  months: number
  setMonths: (n: number) => void
}){
  const visibleBrands = selectedCategoryId === 'all' ? brands : brands.filter(b=>b.categoryId===selectedCategoryId)

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Category</label>
        <select className="border rounded-md px-3 py-2 min-w-[220px]" value={selectedCategoryId} onChange={(e)=>setSelectedCategoryId(e.target.value as any)}>
          <option value="all">All Categories</option>
          {categories.map(c=> (
            <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Brand</label>
        <select className="border rounded-md px-3 py-2 min-w-[220px]" value={selectedBrandId} onChange={(e)=>setSelectedBrandId(e.target.value as any)}>
          <option value="all">All Brands</option>
          {visibleBrands.map(b=> (
            <option key={b.brandId} value={b.brandId}>{b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Retailer</label>
        <select className="border rounded-md px-3 py-2 min-w-[200px]" value={selectedRetailerId} onChange={(e)=>setSelectedRetailerId(e.target.value as any)}>
          <option value="all">All Retailers</option>
          {retailers.map(r=> (
            <option key={r.retailerId} value={r.retailerId}>{r.name}</option>
          ))}
        </select>
      </div>
      <div className="md:ml-auto">
        <label className="block text-xs text-slate-500 mb-1">Months</label>
        <select className="border rounded-md px-3 py-2 min-w-[120px]" value={months} onChange={(e)=>setMonths(Number(e.target.value))}>
          <option value={6}>Last 6</option>
          <option value={12}>Last 12</option>
          <option value={18}>Last 18</option>
        </select>
      </div>
    </div>
  )
}