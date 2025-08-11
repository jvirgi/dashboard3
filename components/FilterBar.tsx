"use client"

import { CategoryDim, BrandDim, RetailerDim } from '@/lib/types'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons'
import { MonthSegment } from './MonthSegment'
import { CommandCombobox, CommandOption } from './CommandCombobox'
import { useState } from 'react'

function SelectRoot({ value, onValueChange, children, open, onOpenChange }: { value: string; onValueChange: (v: string)=>void; children: React.ReactNode; open?: boolean; onOpenChange?: (o:boolean)=>void }){
  return (
    <Select.Root value={value} onValueChange={onValueChange} open={open} onOpenChange={onOpenChange}>
      {children}
    </Select.Root>
  )
}

function SelectTrigger({ placeholder }: { placeholder: string }){
  return (
    <Select.Trigger className="inline-flex items-center justify-between rounded-full bg-white/70 backdrop-blur shadow-soft px-4 py-2 text-sm min-w-[240px] border-0 [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,#a78bfa,#f472b6)_border-box] border border-transparent">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-brand-500 to-accentPink" />
        <Select.Value placeholder={placeholder} />
      </div>
      <Select.Icon className="opacity-70"><ChevronDownIcon /></Select.Icon>
    </Select.Trigger>
  )
}

function SelectContent({ children }: { children: React.ReactNode }){
  return (
    <Select.Portal>
      <Select.Content position="popper" sideOffset={8} className="z-[9999] overflow-hidden rounded-xl border bg-white/95 backdrop-blur shadow-soft max-h-[60vh] overflow-auto">
        <Select.Viewport className="p-1">
          {children}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  )
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }){
  return (
    <Select.Item value={value} className="relative flex select-none items-center rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 focus:bg-brand-50 focus:outline-none">
      <span className="h-2.5 w-2.5 rounded-full bg-brand-500 mr-2" />
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
  const brandOptions: CommandOption[] = visibleBrands.map(b=>({ value: b.brandId, label: b.name, group: categories.find(c=>c.categoryId===b.categoryId)?.name }))

  const [openCat, setOpenCat] = useState(false)
  const [openRet, setOpenRet] = useState(false)

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Category</label>
        <SelectRoot value={String(selectedCategoryId)} onValueChange={(v)=>setSelectedCategoryId(v as any)} open={openCat} onOpenChange={setOpenCat}>
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
        <CommandCombobox
          value={selectedBrandId === 'all' ? '' : String(selectedBrandId)}
          onChange={(v)=>setSelectedBrandId((v || 'all') as any)}
          options={[{ value: '', label: 'All Brands', group: 'All' }, ...brandOptions]}
          placeholder="All Brands"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Retailer</label>
        <SelectRoot value={String(selectedRetailerId)} onValueChange={(v)=>setSelectedRetailerId(v as any)} open={openRet} onOpenChange={setOpenRet}>
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
        <MonthSegment value={months} onChange={setMonths} />
      </div>
    </div>
  )
}