"use client"

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function AnimateCard({ children, className = '' }: { children: ReactNode; className?: string }){
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2 }}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  )
}