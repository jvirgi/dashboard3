"use client"

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon, MixerHorizontalIcon } from '@radix-ui/react-icons'
import { MultiSelectCombobox, MultiOption } from './MultiSelectCombobox'

export function FiltersDrawer({
  open,
  onOpenChange,
  sections,
  onApply,
  onReset
}: {
  open: boolean
  onOpenChange: (v: boolean)=>void
  sections: Array<{ title: string; content: React.ReactNode }>
  onApply: () => void
  onReset: () => void
}){
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-[15000]" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[420px] max-w-[90vw] bg-white shadow-soft border-l flex flex-col overflow-hidden z-[16000]">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-2 text-slate-700"><MixerHorizontalIcon /> Filters</div>
            <Dialog.Close className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700"><Cross2Icon /></Dialog.Close>
          </div>
          <div className="p-4 space-y-4 overflow-auto" style={{ maxHeight: 'calc(100% - 100px)' }}>
            {sections.map((s, idx)=> (
              <div key={idx} className="rounded-lg border p-3">
                <div className="text-sm font-medium mb-2">{s.title}</div>
                {s.content}
              </div>
            ))}
          </div>
          <div className="p-4 mt-auto bg-white border-t flex items-center justify-between">
            <button onClick={onReset} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">Reset</button>
            <button onClick={onApply} className="badge border-brand-200 bg-brand-50 text-brand-800">Apply</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}