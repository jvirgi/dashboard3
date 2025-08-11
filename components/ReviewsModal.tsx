"use client"

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { sampleReviewText } from '@/lib/textGen'
import { ReviewFact, ProductDim, BrandDim, CategoryDim, RetailerDim, ThemeDim } from '@/lib/types'
import { Star } from 'lucide-react'

export function ReviewsModal({ open, onOpenChange, reviews, products, brands, categories, retailers, themes }: {
  open: boolean
  onOpenChange: (v: boolean)=>void
  reviews: ReviewFact[]
  products: ProductDim[]
  brands: BrandDim[]
  categories: CategoryDim[]
  retailers: RetailerDim[]
  themes: ThemeDim[]
}){
  const [page, setPage] = React.useState(1)
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize))
  React.useEffect(()=>{ setPage(1) }, [open, reviews])

  const productById = React.useMemo(()=> new Map(products.map(p=>[p.productId, p])), [products])
  const brandById = React.useMemo(()=> new Map(brands.map(b=>[b.brandId, b])), [brands])
  const categoryById = React.useMemo(()=> new Map(categories.map(c=>[c.categoryId, c])), [categories])
  const retailerById = React.useMemo(()=> new Map(retailers.map(r=>[r.retailerId, r])), [retailers])
  const themeById = React.useMemo(()=> new Map(themes.map(t=>[t.themeId, t])), [themes])

  const slice = React.useMemo(()=>{
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return reviews.slice(start, end)
  }, [reviews, page])

  function Stars({ n }: { n: number }){
    return (
      <div className="inline-flex items-center gap-0.5">
        {Array.from({length:5}).map((_,i)=> (
          <Star key={i} className={`h-4 w-4 ${i < n ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} />
        ))}
      </div>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-12 -translate-x-1/2 w-[960px] max-w-[95vw] max-h-[80vh] overflow-hidden rounded-2xl border bg-white/95 backdrop-blur shadow-soft">
          <div className="border-b px-5 py-3 flex items-center justify-between">
            <Dialog.Title className="font-semibold">All Reviews ({reviews.length.toLocaleString()})</Dialog.Title>
            <Dialog.Close asChild>
              <button className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">Close</button>
            </Dialog.Close>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(80vh-6rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slice.map((r)=>{
                const p = productById.get(r.productId)
                const b = p ? brandById.get(p.brandId) : undefined
                const c = b ? categoryById.get(b.categoryId) : undefined
                const ret = retailerById.get(r.retailerId)
                const themeNames = r.themeIds.map(id=>themeById.get(id)?.name || '').filter(Boolean)
                const text = sampleReviewText(r.reviewId, r.rating, themeNames)
                return (
                  <div key={r.reviewId} className="rounded-xl border bg-white p-4 shadow-soft">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-800 line-clamp-2">{p?.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{b?.name} • {c?.name} • {ret?.name} • {new Date(r.dateKey+'-01').toLocaleDateString(undefined,{ month:'short', year:'numeric' })}</div>
                      </div>
                      <Stars n={r.rating} />
                    </div>
                    <div className="mt-3 text-sm text-slate-800">{text}</div>
                    <div className="mt-2 text-xs text-slate-500">Sentiment: {(r.sentimentScore*100).toFixed(0)}%</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="border-t px-5 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setPage(p=>Math.max(1, p-1))} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700" disabled={page===1}>Prev</button>
              <button onClick={()=>setPage(p=>Math.min(totalPages, p+1))} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700" disabled={page===totalPages}>Next</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}