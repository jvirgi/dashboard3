"use client"

import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid } from 'recharts'

export function BarChartViz({ data, xKey, barKey, color = '#3b82f6' }: { data: any[]; xKey: string; barKey: string; color?: string }){
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey={barKey} fill={color} radius={[6, 6, 0, 0]} name={barKey.replace(/^[a-z]/, (m)=>m.toUpperCase())} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}