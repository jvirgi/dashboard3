"use client"

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export function RadarChartViz({ data, dataKey = 'value', name = 'Profile', color = '#8b5cf6' }: { data: { name: string; value: number }[]; dataKey?: string; name?: string; color?: string }){
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
          <Tooltip />
          <Legend />
          <Radar name={name} dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}