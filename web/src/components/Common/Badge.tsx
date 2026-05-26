'use client'

import { cn } from '@/lib/cn'

interface BadgeProps {
  children: string | React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50',
    secondary: 'bg-slate-700 text-slate-200 border border-slate-600',
    success: 'bg-green-500/20 text-green-300 border border-green-500/50',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/50',
    neutral: 'bg-slate-700 text-slate-300 border border-slate-600',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-block rounded-full font-medium whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}
