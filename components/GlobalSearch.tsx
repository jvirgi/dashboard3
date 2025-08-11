"use client"

import * as React from 'react'
import { Command } from 'cmdk'
import { SearchIcon, XIcon } from 'lucide-react'
import { sampleData } from '@/lib/sampleData'
import { useRouter } from 'next/navigation'

type Suggestion = {
  id: string
  type: 'Product' | 'Brand' | 'Category' | 'Retailer' | 'Theme'
  label: string
  meta?: string
  keyword: string
}

export function GlobalSearch(){
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  React.useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(true)
      } else if (e.key === 'Escape') { setOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  }, [])

  const suggestions = React.useMemo(()=>{
    const q = query.trim().toLowerCase()
    const list: Suggestion[] = []
    const { products, brands, categories, retailers, themes } = sampleData
    for (const p of products) {
      const brand = brands.find(b=>b.brandId===p.brandId)!
      const cat = categories.find(c=>c.categoryId===brand.categoryId)!
      const hay = `${p.name} ${brand.name} ${cat.name} ${p.attributes.join(' ')}`.toLowerCase()
      if (!q || hay.includes(q)) list.push({ id: p.productId, type:'Product', label: p.name, meta: `${brand.name} • ${cat.name}`, keyword: p.name.toLowerCase() })
    }
    for (const b of brands){
      const cat = categories.find(c=>c.categoryId===b.categoryId)!
      if (!q || `${b.name} ${cat.name}`.toLowerCase().includes(q)) list.push({ id: b.brandId, type:'Brand', label: b.name, meta: cat.name, keyword: b.name.toLowerCase() })
    }
    for (const c of categories){
      if (!q || c.name.toLowerCase().includes(q)) list.push({ id: c.categoryId, type:'Category', label: c.name, keyword: c.name.toLowerCase() })
    }
    for (const r of retailers){
      if (!q || r.name.toLowerCase().includes(q)) list.push({ id: r.retailerId, type:'Retailer', label: r.name, keyword: r.name.toLowerCase() })
    }
    for (const t of themes){
      if (!q || t.name.toLowerCase().includes(q)) list.push({ id: t.themeId, type:'Theme', label: t.name, keyword: t.name.toLowerCase() })
    }
    return list.slice(0, 50)
  }, [query])

  const onSelect = (s: Suggestion) => {
    // Navigate to overview with a q param to prefilter
    const q = encodeURIComponent(s.label)
    router.push(`/?q=${q}`)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(true)} className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur shadow-soft px-3 py-1.5 text-sm border-0 [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,#a78bfa,#f472b6)_border-box] border border-transparent">
        <SearchIcon className="h-4 w-4 opacity-70" />
        <span className="opacity-70">Search…</span>
        <span className="ml-2 text-[10px] text-slate-400 border rounded px-1 py-0.5">Ctrl K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[30000]">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)} />
          <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[700px] max-w-[90vw] rounded-2xl border bg-white/95 backdrop-blur shadow-soft">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <SearchIcon className="h-4 w-4 opacity-70" />
              <input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search products, brands, categories, retailers, themes…" className="w-full outline-none bg-transparent text-sm" />
              <button onClick={()=>setOpen(false)} className="opacity-60 hover:opacity-100"><XIcon className="h-4 w-4"/></button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-2">
              <Command shouldFilter={false}>
                <Command.List>
                  {(['Product','Brand','Category','Retailer','Theme'] as const).map((group)=>{
                    const groupItems = suggestions.filter(s=>s.type===group)
                    if (!groupItems.length) return null
                    return (
                      <Command.Group key={group} heading={group} className="text-[11px] uppercase tracking-wide text-slate-400">
                        {groupItems.map(s=> (
                          <Command.Item key={`${s.type}-${s.id}`} value={s.label} onSelect={()=>onSelect(s)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-brand-50">
                            <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                            <div className="flex-1">
                              <div className="font-medium text-slate-800">{s.label}</div>
                              {s.meta && <div className="text-xs text-slate-500">{s.meta}</div>}
                            </div>
                            <div className="text-[10px] text-slate-400">{s.type}</div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )
                  })}
                </Command.List>
              </Command>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}