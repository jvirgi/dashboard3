"use client"

import { ReactNode } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import CountUp from 'react-countup'

type KPIValue = string | number | ReactNode

export function KPIStat({ icon, label, value, delta, suffix }: { icon: ReactNode; label: string; value: KPIValue; delta?: number; suffix?: string }){
  const trendingUp = (delta ?? 0) >= 0
  const renderValue = () => {
    if (typeof value === 'number') {
      return (
        <span className="tabular-nums">
          <CountUp end={value} duration={0.8} separator="," decimals={Number.isInteger(value) ? 0 : 2} />{suffix ? <span className="ml-0.5">{suffix}</span> : null}
        </span>
      )
    }
    return value
  }

  return (
    <div className="kpi overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-xl font-semibold flex items-center gap-3 min-w-0">
              <span className="truncate">{renderValue()}</span>
            </div>
          </div>
        </div>
        {delta !== undefined && (
          <div className={`shrink-0 badge ${trendingUp ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {trendingUp ? <ArrowUpRight className="h-3.5 w-3.5"/> : <ArrowDownRight className="h-3.5 w-3.5"/>}
            {Math.abs(delta).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}