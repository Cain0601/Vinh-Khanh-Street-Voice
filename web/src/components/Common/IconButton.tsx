'use client'

import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string | React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  const variantClasses = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800',
  }

  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-lg transition-colors',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
