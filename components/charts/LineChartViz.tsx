"use client"

import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Area, Line, CartesianGrid } from 'recharts'

export function LineChartViz({ data, yLeftKey, yRightKey }: { data: any[]; yLeftKey: string; yRightKey: string }){
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey={yLeftKey} fill="#93c5fd" stroke="#60a5fa" name="Reviews" />
          <Line yAxisId="right" type="monotone" dataKey={yRightKey} stroke="#8b5cf6" strokeWidth={2} dot={false} name="Avg Rating" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}