"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts'

export function StackedRatingArea({ data, showBrush = false }: { data: Array<any>; showBrush?: boolean }){
  const colors = {
    r1: '#ef4444',
    r2: '#f97316',
    r3: '#f59e0b',
    r4: '#10b981',
    r5: '#3b82f6'
  }
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 18 }}>
          <defs>
            <linearGradient id="brushTrackArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--brush-from)" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="var(--brush-to)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 'dataMax']} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="r1" stackId="1" stroke={colors.r1} fill={colors.r1} name="1★" />
          <Area type="monotone" dataKey="r2" stackId="1" stroke={colors.r2} fill={colors.r2} name="2★" />
          <Area type="monotone" dataKey="r3" stackId="1" stroke={colors.r3} fill={colors.r3} name="3★" />
          <Area type="monotone" dataKey="r4" stackId="1" stroke={colors.r4} fill={colors.r4} name="4★" />
          <Area type="monotone" dataKey="r5" stackId="1" stroke={colors.r5} fill={colors.r5} name="5★" />
          {showBrush && <Brush height={18} travellerWidth={10} stroke="var(--brush-from)" fill="url(#brushTrackArea)" />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}