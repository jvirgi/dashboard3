"use client"

import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid, LabelList } from 'recharts'

function TooltipContent({ active, payload, label }: any){
  if (!active || !payload?.length) return null
  const [series] = payload
  return (
    <div className="rounded-lg border bg-white/95 p-3 shadow-soft">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1">{series?.name}: <span className="font-medium">{series?.value}</span></div>
    </div>
  )
}

export function BarChartViz({ data, xKey, barKey, color = '#3b82f6', onBarClick }: { data: any[]; xKey: string; barKey: string; color?: string; onBarClick?: (name: string) => void }){
  const name = barKey.replace(/^[a-z]/, (m)=>m.toUpperCase())
  const gradId = `grad-${barKey.replace(/[^a-z0-9]/gi,'')}`
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<TooltipContent/>} />
          <Legend />
          <Bar dataKey={barKey} fill={`url(#${gradId})`} radius={[8, 8, 0, 0]} name={name} onClick={(d:any)=> onBarClick?.(d?.name)} cursor={onBarClick ? 'pointer' : 'default'}>
            <LabelList dataKey={barKey} position="top" className="fill-slate-600 text-[11px]" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}