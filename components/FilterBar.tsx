"use client"

import { CategoryDim, BrandDim, RetailerDim } from '@/lib/types'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons'

function SelectRoot({ value, onValueChange, children }: { value: string; onValueChange: (v: string)=>void; children: React.ReactNode }){
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      {children}
    </Select.Root>
  )
}

function SelectTrigger({ placeholder }: { placeholder: string }){
  return (
    <Select.Trigger className="inline-flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm min-w-[220px] shadow-soft">
      <Select.Value placeholder={placeholder} />
      <Select.Icon>
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
  )
}

function SelectContent({ children }: { children: React.ReactNode }){
  return (
    <Select.Content className="overflow-hidden rounded-md border bg-white shadow-soft">
      <Select.Viewport className="p-1">
        {children}
      </Select.Viewport>
    </Select.Content>
  )
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }){
  return (
    <Select.Item value={value} className="relative flex select-none items-center rounded px-2 py-1.5 text-sm text-slate-700 focus:bg-brand-50 focus:outline-none">
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  )
}

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
        <SelectRoot value={String(selectedCategoryId)} onValueChange={(v)=>setSelectedCategoryId(v as any)}>
          <SelectTrigger placeholder="All Categories" />
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c=> (
              <SelectItem key={c.categoryId} value={c.categoryId}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Brand</label>
        <SelectRoot value={String(selectedBrandId)} onValueChange={(v)=>setSelectedBrandId(v as any)}>
          <SelectTrigger placeholder="All Brands" />
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {visibleBrands.map(b=> (
              <SelectItem key={b.brandId} value={b.brandId}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Retailer</label>
        <SelectRoot value={String(selectedRetailerId)} onValueChange={(v)=>setSelectedRetailerId(v as any)}>
          <SelectTrigger placeholder="All Retailers" />
          <SelectContent>
            <SelectItem value="all">All Retailers</SelectItem>
            {retailers.map(r=> (
              <SelectItem key={r.retailerId} value={r.retailerId}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>
      <div className="md:ml-auto">
        <label className="block text-xs text-slate-500 mb-1">Months</label>
        <SelectRoot value={String(months)} onValueChange={(v)=>setMonths(Number(v))}>
          <SelectTrigger placeholder="Last 12" />
          <SelectContent>
            <SelectItem value={String(6)}>Last 6</SelectItem>
            <SelectItem value={String(12)}>Last 12</SelectItem>
            <SelectItem value={String(18)}>Last 18</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>
    </div>
  )
}