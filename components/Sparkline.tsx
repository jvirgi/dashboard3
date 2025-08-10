"use client"

import { LineChart, Line, ResponsiveContainer } from 'recharts'

export function Sparkline({ data, dataKey = 'value', color = '#6366f1' }: { data: any[]; dataKey?: string; color?: string }){
  return (
    <div className="h-10 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}