"use client"

import * as React from 'react'
import { Command } from 'cmdk'
import { CheckIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { createPortal } from 'react-dom'
import { useDropdownManager } from './DropdownManager'

export type CommandOption = { value: string; label: string; group?: string; meta?: string }

type Coords = { top: number; left: number; width: number } | null

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
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [coords, setCoords] = React.useState<Coords>(null)
  const mgr = useDropdownManager()
  const id = React.useId()

  const groups = React.useMemo(()=>{
    const map = new Map<string, CommandOption[]>()
    for (const opt of options){
      const key = opt.group || 'All'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(opt)
    }
    return Array.from(map.entries())
  }, [options])

  const openMenu = () => {
    mgr?.open(id)
    setOpen(true)
    setTimeout(()=>{
      inputRef.current?.focus()
      if (triggerRef.current){
        const rect = triggerRef.current.getBoundingClientRect()
        const left = Math.min(rect.left, window.innerWidth - rect.width - 8)
        const top = Math.min(rect.bottom + 8, window.innerHeight - 200)
        setCoords({ top, left, width: rect.width })
      }
    }, 0)
  }

  const closeMenu = () => { setOpen(false); mgr?.close() }

  React.useEffect(()=>{
    if (!open) return
    const onResize = () => { closeMenu() }
    const onClickAway = (e: MouseEvent) => {
      const t = e.target as Node
      if (menuRef.current?.contains(t)) return
      if (triggerRef.current?.contains(t)) return
      closeMenu()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    document.addEventListener('mousedown', onClickAway, true)
    document.addEventListener('touchstart', () => onClickAway(new MouseEvent('mousedown') as any), true)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      document.removeEventListener('mousedown', onClickAway, true)
      document.removeEventListener('touchstart', () => onClickAway(new MouseEvent('mousedown') as any), true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  React.useEffect(()=>{
    if (!mgr || !open) return
    if (mgr.openId && mgr.openId !== id) {
      // another dropdown opened, close this one
      setOpen(false)
    }
  }, [mgr?.openId, open, id])

  return (
    <div className="relative min-w-[280px]">
      <button
        ref={triggerRef}
        onClick={openMenu}
        className="inline-flex items-center justify-between rounded-full bg-white/70 backdrop-blur shadow-soft px-4 py-2 text-sm w-full border-0 [background:linear-gradient(white,white)_padding-box,linear-gradient(90deg,#a78bfa,#f472b6)_border-box] border border-transparent"
      >
        <div className="flex items-center gap-2 text-left">
          <MagnifyingGlassIcon className="opacity-60" />
          <span className="truncate">{options.find(o=>o.value===value)?.label || placeholder}</span>
        </div>
      </button>
      {open && coords && createPortal(
        <>
          <div onMouseDown={closeMenu} onTouchStart={closeMenu} style={{ position:'fixed', inset:0, zIndex: 4000 }} />
          <div ref={menuRef} style={{ position: 'fixed', top: coords.top, left: coords.left, width: Math.min(coords.width, window.innerWidth - 16), zIndex: 5000 }} className="max-w-[90vw] rounded-xl border bg-white/95 backdrop-blur shadow-soft max-h-[60vh] overflow-auto">
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
                        onSelect={() => { onChange(opt.value); closeMenu() }}
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
        </>,
        document.body
      )}
    </div>
  )
}