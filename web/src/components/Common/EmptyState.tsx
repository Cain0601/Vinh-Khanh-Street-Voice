'use client'

import { ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  children?: ReactNode
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-4 text-center">
      <div className="text-5xl">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
      </div>
      {children}
      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={() => window.location.href = action.href}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
