'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SafeAreaProps {
  children: ReactNode
  className?: string
}

export default function SafeArea({ children, className }: SafeAreaProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}
