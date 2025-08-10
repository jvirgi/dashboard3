"use client"

import { useEffect, useState } from 'react'

const defaultSettings = {
  headerGradientFrom: '#3b82f6',
  headerGradientTo: '#ec4899',
  brushFrom: '#a78bfa',
  brushTo: '#f472b6',
  kpiChipPositive: '#10b981',
  kpiChipNegative: '#ef4444',
}

export default function AdminPage(){
  const [settings, setSettings] = useState(defaultSettings)
  useEffect(()=>{
    const saved = localStorage.getItem('voc-admin-settings')
    if (saved) setSettings(JSON.parse(saved))
  }, [])
  useEffect(()=>{
    localStorage.setItem('voc-admin-settings', JSON.stringify(settings))
    // apply simple CSS vars for demo
    const root = document.documentElement
    root.style.setProperty('--header-from', settings.headerGradientFrom)
    root.style.setProperty('--header-to', settings.headerGradientTo)
  }, [settings])

  const onChange = (key: keyof typeof defaultSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(s=>({ ...s, [key]: e.target.value }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Admin Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Header Gradient</h3>
          <label className="block text-sm mb-1">From</label>
          <input type="color" value={settings.headerGradientFrom} onChange={onChange('headerGradientFrom')} className="w-24 h-10" />
          <label className="block text-sm mt-3 mb-1">To</label>
          <input type="color" value={settings.headerGradientTo} onChange={onChange('headerGradientTo')} className="w-24 h-10" />
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Brush Gradient</h3>
          <label className="block text-sm mb-1">From</label>
          <input type="color" value={settings.brushFrom} onChange={onChange('brushFrom')} className="w-24 h-10" />
          <label className="block text-sm mt-3 mb-1">To</label>
          <input type="color" value={settings.brushTo} onChange={onChange('brushTo')} className="w-24 h-10" />
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">KPI Chip Colors</h3>
          <label className="block text-sm mb-1">Positive</label>
          <input type="color" value={settings.kpiChipPositive} onChange={onChange('kpiChipPositive')} className="w-24 h-10" />
          <label className="block text-sm mt-3 mb-1">Negative</label>
          <input type="color" value={settings.kpiChipNegative} onChange={onChange('kpiChipNegative')} className="w-24 h-10" />
        </div>
      </div>
    </div>
  )
}