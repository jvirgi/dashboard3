"use client"

import * as React from 'react'
import { Command } from 'cmdk'
import { CheckIcon, Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

export type MultiOption = { value: string; label: string; group?: string; meta?: string }

export function MultiSelectCombobox({
  placeholder = 'Select…',
  values,
  onChange,
  options,
  emptyText = 'No results',
  maxChips = 3,
}: {
  placeholder?: string
  values: string[]
  onChange: (vals: string[]) => void
  options: MultiOption[]
  emptyText?: string
  maxChips?: number
}){
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const groups = React.useMemo(()=>{
    const map = new Map<string, MultiOption[]>()
    for (const opt of options){
      const key = opt.group || 'All'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(opt)
    }
    return Array.from(map.entries())
  }, [options])

  const selected = React.useMemo(()=> options.filter(o=>values.includes(o.value)), [values, options])

  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter(x=>x!==v))
    else onChange([...values, v])
  }

  const clearAll = (e: React.MouseEvent) => { e.stopPropagation(); onChange([]) }

  return (
    <div className="relative min-w-[280px]">
      <button
        onClick={()=>{ setOpen(true); setTimeout(()=>inputRef.current?.focus(), 0) }}
        className="inline-flex items-center justify-between rounded-full bg-white/70 backdrop-blur shadow-soft px-4 py-2 text-sm w-full border-0 [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,#a78bfa,#f472b6)_border-box] border border-transparent"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MagnifyingGlassIcon className="opacity-60 shrink-0" />
          {selected.length === 0 ? (
            <span className="truncate opacity-70">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1 flex-wrap">
              {selected.slice(0, maxChips).map(s=> (
                <span key={s.value} className="badge border-slate-200 bg-white text-slate-700">{s.label}</span>
              ))}
              {selected.length > maxChips && <span className="text-xs text-slate-600">+{selected.length - maxChips}</span>}
            </div>
          )}
        </div>
        {selected.length > 0 && (
          <button onClick={clearAll} className="ml-2 inline-flex items-center justify-center rounded-full bg-white/80 border border-slate-200 h-6 w-6">
            <Cross2Icon />
          </button>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-[520px] max-w-[90vw] overflow-hidden rounded-xl border bg-white/95 backdrop-blur shadow-soft">
          <Command shouldFilter={true} filter={(val, search)=>val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <MagnifyingGlassIcon />
              <Command.Input ref={inputRef} placeholder={placeholder} className="w-full outline-none bg-transparent text-sm" />
            </div>
            <Command.List className="max-h-72 overflow-auto p-1">
              <Command.Empty className="px-3 py-2 text-sm text-slate-500">{emptyText}</Command.Empty>
              {groups.map(([group, opts]) => (
                <Command.Group key={group} heading={group} className="text-[11px] uppercase tracking-wide text-slate-400">
                  {opts.map(opt => (
                    <Command.Item
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => toggle(opt.value)}
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 aria-selected:bg-brand-50"
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${values.includes(opt.value) ? 'bg-brand-600' : 'bg-slate-300'}`} />
                      <div className="flex-1 truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.meta && <div className="text-xs text-slate-500 truncate">{opt.meta}</div>}
                      </div>
                      {values.includes(opt.value) && <CheckIcon />}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  )
}