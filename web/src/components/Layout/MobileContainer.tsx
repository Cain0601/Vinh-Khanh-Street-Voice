'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface MobileContainerProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export default function MobileContainer({
  children,
  className,
  padding = true,
}: MobileContainerProps) {
  return (
    <div className="flex h-screen justify-center bg-slate-900 max-w-lg w-full mx-auto">
      <div
        className={cn(
          'max-w-mobile flex flex-col bg-slate-900 text-white w-full relative h-screen',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
