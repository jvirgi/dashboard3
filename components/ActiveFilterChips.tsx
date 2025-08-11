"use client"

export function ActiveFilterChips({ chips, onRemove }: { chips: Array<{ key: string; label: string }>; onRemove: (key:string)=>void }){
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.slice(0,8).map(c=> (
        <button key={c.key} onClick={()=>onRemove(c.key)} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
          {c.label}
          <span className="ml-1">×</span>
        </button>
      ))}
      {chips.length>8 && <span className="text-xs text-slate-500">+{chips.length-8} more</span>}
    </div>
  )
}