'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  className?: string
  action?: ReactNode
}

export default function Header({
  title,
  showBack = false,
  onBack,
  className,
  action,
}: HeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 sticky top-0 right-0 w-full z-40 bg-background', className)}>
      <div className="flex items-center gap-3 flex-1">
        {showBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-lg transition"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold">
              FT
            </div>
            {!title && <span className="font-semibold">FoodTour</span>}
          </Link>
        )}
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}

import { ReactNode } from 'react'
