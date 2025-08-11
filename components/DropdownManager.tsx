"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Ctx = {
  openId: string | null
  open: (id: string) => void
  close: () => void
}

const DropdownManagerContext = createContext<Ctx | null>(null)

export function DropdownManagerProvider({ children }: { children: React.ReactNode }){
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(()=>{
    if (openId) document.body.classList.add('dropdown-open'); else document.body.classList.remove('dropdown-open')
  }, [openId])

  const value = useMemo<Ctx>(()=>({
    openId,
    open: (id: string) => setOpenId(id),
    close: () => setOpenId(null)
  }), [openId])

  return (
    <DropdownManagerContext.Provider value={value}>{children}</DropdownManagerContext.Provider>
  )
}

export function useDropdownManager(){
  return useContext(DropdownManagerContext)
}