"use client"

import clsx from 'clsx'

export function HeatmapGrid({ rows, cols, values, legendLabel = 'Avg Rating' }: { rows: string[]; cols: string[]; values: number[][]; legendLabel?: string }){
  const flat = values.flat()
  const min = Math.min(...flat)
  const max = Math.max(...flat)
  function color(v: number){
    if (Number.isNaN(v)) return '#e5e7eb'
    const t = (v - min) / (max - min || 1)
    // green to purple ramp
    const r = Math.round(59 + t * (139 - 59))
    const g = Math.round(130 + t * (92 - 130))
    const b = Math.round(246 + t * (246 - 246))
    return `rgb(${r},${g},${b})`
  }
  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: `120px repeat(${cols.length}, minmax(0, 1fr))` }}>
        <div />
        {cols.map((c) => (
          <div key={c} className="text-xs text-slate-500 text-center pb-2">{c}</div>
        ))}
        {rows.map((r, i) => (
          <>
            <div key={`row-${r}`} className="text-xs text-slate-600 pr-2 py-1 flex items-center">{r}</div>
            {cols.map((c, j) => (
              <div key={`${i}-${j}`} className="h-8 rounded-md m-0.5 border border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" style={{ backgroundColor: color(values[i][j]) }} title={`${r} • ${c}: ${values[i][j].toFixed(2)}`}></div>
            ))}
          </>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span>{legendLabel}</span>
        <div className="h-2 w-24 rounded" style={{ background: 'linear-gradient(90deg, #10b981, #8b5cf6)' }} />
        <span>{min.toFixed(1)}–{max.toFixed(1)}</span>
      </div>
    </div>
  )
}