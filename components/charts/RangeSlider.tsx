"use client"

import * as React from 'react'

export function RangeSlider({ min = 0, max = 100, value, onChange, labels }: { min?: number; max?: number; value: [number, number]; onChange: (v: [number, number])=>void; labels?: string[] }){
  const [local, setLocal] = React.useState<[number, number]>(value)
  React.useEffect(()=> setLocal(value), [value])

  const pct = (n: number) => ((n - min) / (max - min)) * 100
  const left = Math.min(local[0], local[1])
  const right = Math.max(local[0], local[1])

  const onInput = (idx: 0|1) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    const next: [number, number] = idx===0 ? [v, local[1]] : [local[0], v]
    setLocal(next)
    onChange(next)
  }

  return (
    <div className="relative w-full py-2">
      <div className="relative h-2 rounded-full bg-gradient-to-r from-indigo-200 via-pink-200 to-rose-200">
        <div className="absolute h-2 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400" style={{ left: `${pct(left)}%`, width: `${pct(right)-pct(left)}%` }} />
      </div>
      <input type="range" min={min} max={max} value={local[0]} onChange={onInput(0)} className="absolute left-0 right-0 -top-1 h-4 w-full appearance-none bg-transparent pointer-events-auto" style={{ WebkitAppearance: 'none' }} />
      <input type="range" min={min} max={max} value={local[1]} onChange={onInput(1)} className="absolute left-0 right-0 -top-1 h-4 w-full appearance-none bg-transparent pointer-events-auto" style={{ WebkitAppearance: 'none' }} />
      <style jsx>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 9999px; background: white; border: 2px solid #a78bfa; box-shadow: 0 2px 6px rgba(0,0,0,0.15); cursor: pointer; }
        input[type=range]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 9999px; background: white; border: 2px solid #a78bfa; box-shadow: 0 2px 6px rgba(0,0,0,0.15); cursor: pointer; }
      `}</style>
      {labels && (
        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          {labels.map((l,i)=>(<span key={i}>{l}</span>))}
        </div>
      )}
    </div>
  )
}