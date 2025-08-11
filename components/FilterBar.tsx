"use client"

import { CategoryDim, BrandDim, RetailerDim } from '@/lib/types'
import { MonthSegment } from './MonthSegment'
import { CommandCombobox, CommandOption } from './CommandCombobox'

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
  const categoryOptions: CommandOption[] = [{ value: 'all', label: 'All Categories' }, ...categories.map(c=>({ value: c.categoryId, label: c.name }))]
  const visibleBrands = selectedCategoryId === 'all' ? brands : brands.filter(b=>b.categoryId===selectedCategoryId)
  const brandOptions: CommandOption[] = [{ value: '', label: 'All Brands', group: 'All' }, ...visibleBrands.map(b=>({ value: b.brandId, label: b.name, group: categories.find(c=>c.categoryId===b.categoryId)?.name }))]
  const retailerOptions: CommandOption[] = [{ value: 'all', label: 'All Retailers' }, ...retailers.map(r=>({ value: r.retailerId, label: r.name }))]

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Category</label>
        <CommandCombobox
          value={String(selectedCategoryId)}
          onChange={(v)=>setSelectedCategoryId((v || 'all') as any)}
          options={categoryOptions}
          placeholder="All Categories"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Brand</label>
        <CommandCombobox
          value={selectedBrandId === 'all' ? '' : String(selectedBrandId)}
          onChange={(v)=>setSelectedBrandId((v || 'all') as any)}
          options={brandOptions}
          placeholder="All Brands"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Retailer</label>
        <CommandCombobox
          value={String(selectedRetailerId === 'all' ? '' : selectedRetailerId)}
          onChange={(v)=>setSelectedRetailerId((v || 'all') as any)}
          options={retailerOptions}
          placeholder="All Retailers"
        />
      </div>
      <div className="md:ml-auto">
        <label className="block text-xs text-slate-500 mb-1">Months</label>
        <MonthSegment value={months} onChange={setMonths} />
      </div>
    </div>
  )
}