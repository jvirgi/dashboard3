"use client"

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'

export function TreemapViz({ data, dataKey = 'value' }: { data: { name: string; value: number }[]; dataKey?: string }){
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {/* @ts-ignore */}
        <Treemap data={data} dataKey={dataKey} stroke="#fff" fill="#60a5fa" aspectRatio={4/3} animationDuration={400} />
      </ResponsiveContainer>
    </div>
  )
}