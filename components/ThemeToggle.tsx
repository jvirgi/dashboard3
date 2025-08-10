"use client"

import { useEffect, useState } from 'react'

export function ThemeToggle(){
  const [dark, setDark] = useState(false)
  useEffect(()=>{
    const saved = localStorage.getItem('theme-dark')
    if (saved) setDark(saved === '1')
  }, [])
  useEffect(()=>{
    const root = document.documentElement
    if (dark) root.classList.add('dark'); else root.classList.remove('dark')
    localStorage.setItem('theme-dark', dark ? '1' : '0')
  }, [dark])
  return (
    <button onClick={()=>setDark(v=>!v)} className="badge border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}