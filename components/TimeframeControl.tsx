"use client"

import * as React from 'react'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons'
import { DateDim } from '@/lib/types'

export type TimeframeValue =
  | { mode: 'preset'; months: number }
  | { mode: 'custom'; startKey: string; endKey: string }

export function TimeframeControl({ dates, value, onChange }: { dates: DateDim[]; value: TimeframeValue; onChange: (v: TimeframeValue)=>void }){
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(()=>{
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown, true)
    return ()=> document.removeEventListener('mousedown', onDown, true)
  }, [])

  const sorted = React.useMemo(()=> [...dates].sort((a,b)=>a.date.getTime()-b.date.getTime()), [dates])
  const hasDates = sorted.length > 0

  const labelFor = (key: string) => {
    const d = sorted.find(d=>d.dateKey===key)
    return d ? `${d.monthName} ${String(d.year).slice(-2)}` : key
  }

  const startKey = hasDates ? (value.mode==='custom' ? value.startKey : (sorted.at(-12)?.dateKey || sorted[0]?.dateKey)) : undefined
  const endKey = hasDates ? (value.mode==='custom' ? value.endKey : (sorted.at(-1)?.dateKey || sorted.at(-1)?.dateKey)) : undefined

  const setStart = (k: string) => onChange({ mode: 'custom', startKey: k, endKey: endKey! })
  const setEnd = (k: string) => onChange({ mode: 'custom', startKey: startKey!, endKey: k })

  const isPreset = value.mode==='preset'

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200">
        {([3,6,12,24] as const).map(m => (
          <button key={m} onClick={()=>onChange({ mode:'preset', months: m })} disabled={!hasDates} className={`px-3 py-1.5 text-sm rounded-full transition ${(!hasDates ? 'opacity-50 cursor-not-allowed ' : '')}${isPreset && value.months===m ? 'bg-white shadow-soft text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>{m}M</button>
        ))}
        <button onClick={()=>{ if (!hasDates) return; onChange({ mode:'custom', startKey: startKey!, endKey: endKey! }); setOpen(o=>!o) }} disabled={!hasDates} className={`px-3 py-1.5 text-sm rounded-full transition ${(!hasDates ? 'opacity-50 cursor-not-allowed ' : '')}${value.mode==='custom' ? 'bg-white shadow-soft text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Custom</button>
      </div>
      {value.mode==='custom' && open && hasDates && (
        <div className="z-[4500] absolute left-0 mt-2 rounded-xl border bg-white/95 backdrop-blur shadow-soft p-3 max-h-[70vh] overflow-auto">
          <div className="text-xs text-slate-500 mb-1">Start</div>
          <MonthSelect options={sorted} value={startKey!} onValueChange={(v)=>setStart(v)} />
          <div className="text-xs text-slate-500 mt-3 mb-1">End</div>
          <MonthSelect options={sorted} value={endKey!} onValueChange={(v)=>setEnd(v)} />
        </div>
      )}
    </div>
  )
}

function MonthSelect({ options, value, onValueChange }: { options: DateDim[]; value: string; onValueChange: (v:string)=>void }){
  const disabled = options.length === 0
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger className={`inline-flex items-center justify-between rounded-md bg-white/70 backdrop-blur shadow-soft px-3 py-2 text-sm min-w-[220px] border-0 [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,#a78bfa,#f472b6)_border-box] border border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <Select.Value placeholder="Select month" />
        <Select.Icon className="opacity-70"><ChevronDownIcon /></Select.Icon>
      </Select.Trigger>
      {!disabled && (
        <Select.Portal>
          <Select.Content position="popper" sideOffset={8} className="z-[2000] overflow-hidden rounded-xl border bg-white/95 backdrop-blur shadow-soft">
            <Select.Viewport className="p-1">
              {options.map(opt => (
                <Select.Item key={opt.dateKey} value={opt.dateKey} className="relative flex select-none items-center rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 focus:bg-brand-50 focus:outline-none">
                  <Select.ItemText>{opt.monthName} {String(opt.year).slice(-2)}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      )}
    </Select.Root>
  )
}