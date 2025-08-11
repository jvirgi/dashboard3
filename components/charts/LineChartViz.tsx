"use client"

import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Area, Line, CartesianGrid, ReferenceLine, Brush } from 'recharts'

function TooltipContent({ active, payload, label }: any){
  if (!active || !payload?.length) return null
  const [vol, rate] = payload
  return (
    <div className="rounded-lg border bg-white/95 p-3 shadow-soft">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 flex items-center gap-3">
        <span className="badge border-brand-200 bg-brand-50 text-brand-700">Reviews {vol?.value}</span>
        <span className="badge border-amber-200 bg-amber-50 text-amber-700">★ {Number(rate?.value ?? 0).toFixed(2)}</span>
      </div>
    </div>
  )
}

export function LineChartViz({ data, yLeftKey, yRightKey, syncId = 'overview', targetRating = 4.2, showBrush = false }: { data: any[]; yLeftKey: string; yRightKey: string; syncId?: string; targetRating?: number; showBrush?: boolean }){
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} syncId={syncId} margin={{ top: 10, right: 20, left: 0, bottom: 18 }}>
          <defs>
            <linearGradient id="gradArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35}/>
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="brushTrack" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--brush-from)" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="var(--brush-to)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 5]} />
          <Tooltip content={<TooltipContent/>} />
          <Legend />
          <ReferenceLine yAxisId="right" y={targetRating} stroke="#10b981" strokeDasharray="4 4" label="Target" />
          <Area yAxisId="left" type="monotone" dataKey={yLeftKey} fill="url(#gradArea)" stroke="#60a5fa" name="Reviews" />
          <Line yAxisId="right" type="monotone" dataKey={yRightKey} stroke="#8b5cf6" strokeWidth={2} dot={false} name="Avg Rating" />
          {showBrush && <Brush height={18} travellerWidth={10} stroke="var(--brush-from)" fill="url(#brushTrack)" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}