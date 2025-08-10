"use client"

import * as React from 'react'
import { Command } from 'cmdk'
import { CheckIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

export type CommandOption = { value: string; label: string; group?: string; meta?: string }

export function CommandCombobox({
  placeholder = 'Search…',
  value,
  onChange,
  options,
  emptyText = 'No results'
}: {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  options: CommandOption[]
  emptyText?: string
}){
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const groups = React.useMemo(()=>{
    const map = new Map<string, CommandOption[]>()
    for (const opt of options){
      const key = opt.group || 'All'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(opt)
    }
    return Array.from(map.entries())
  }, [options])

  return (
    <div className="relative min-w-[280px]">
      <button
        onClick={()=>{ setOpen(true); setTimeout(()=>inputRef.current?.focus(), 0) }}
        className="inline-flex items-center justify-between rounded-full bg-white/70 backdrop-blur shadow-soft px-4 py-2 text-sm w-full border-0 [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,#a78bfa,#f472b6)_border-box] border border-transparent"
      >
        <div className="flex items-center gap-2 text-left">
          <MagnifyingGlassIcon className="opacity-60" />
          <span className="truncate">{options.find(o=>o.value===value)?.label || placeholder}</span>
        </div>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-[480px] max-w-[90vw] overflow-hidden rounded-xl border bg-white/95 backdrop-blur shadow-soft">
          <Command shouldFilter={true} filter={(val, search)=>val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <MagnifyingGlassIcon />
              <Command.Input ref={inputRef} placeholder={placeholder} className="w-full outline-none bg-transparent text-sm" />
            </div>
            <Command.List className="max-h-64 overflow-auto p-1">
              <Command.Empty className="px-3 py-2 text-sm text-slate-500">{emptyText}</Command.Empty>
              {groups.map(([group, opts]) => (
                <Command.Group key={group} heading={group} className="text-[11px] uppercase tracking-wide text-slate-400">
                  {opts.map(opt => (
                    <Command.Item
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => { onChange(opt.value); setOpen(false) }}
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 aria-selected:bg-brand-50"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                      <div className="flex-1 truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.meta && <div className="text-xs text-slate-500 truncate">{opt.meta}</div>}
                      </div>
                      {value === opt.value && <CheckIcon />}
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