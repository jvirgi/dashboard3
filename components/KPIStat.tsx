"use client"

import { ReactNode } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function KPIStat({ icon, label, value, delta }: { icon: ReactNode; label: string; value: string | number; delta?: number }){
  const trendingUp = (delta ?? 0) >= 0
  return (
    <div className="kpi">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        </div>
        {delta !== undefined && (
          <div className={`badge ${trendingUp ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {trendingUp ? <ArrowUpRight className="h-3.5 w-3.5"/> : <ArrowDownRight className="h-3.5 w-3.5"/>}
            {Math.abs(delta).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}