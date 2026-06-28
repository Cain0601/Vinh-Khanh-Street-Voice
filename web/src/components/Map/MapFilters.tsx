'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCategories } from '@/lib/api'
import { cn } from '@/lib/cn'

interface MapFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

type Category = {
  id: string
  name?: string | { vi?: string; en?: string }
  title?: string
  slug?: string
  icon?: string
  order?: number
  active?: boolean
}

function getCategoryLabel(category: Category) {
  if (typeof category.name === 'string') return category.name
  return category.name?.vi || category.name?.en || category.title || category.slug || category.id
}

export default function MapFilters({ activeFilter, onFilterChange }: MapFiltersProps) {
  const [filters, setFilters] = useState<Category[]>([])

  useEffect(() => {
    let mounted = true

    const fetchFilters = async () => {
      try {
        const response = await getCategories()
        if (!mounted) return

        const categories = Array.isArray(response.data) ? (response.data as Category[]) : []
        setFilters(categories)
      } catch {
        if (!mounted) return
        setFilters([])
      }
    }

    fetchFilters()

    return () => {
      mounted = false
    }
  }, [])

  const visibleFilters = useMemo(
    () =>
      [
        { id: 'all', label: 'Tất cả', icon: '📍' },
        ...filters
          .filter((filter) => filter.active !== false)
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((filter) => ({
            id: filter.id,
            label: getCategoryLabel(filter),
            icon: filter.icon || '📍',
          })),
      ] as Array<{ id: string; label: string; icon: string }>,
    [filters],
  )

  return (
    <div className="w-full px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
        {visibleFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border snap-start',
              activeFilter === filter.id
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500',
            )}
          >
            <span className="text-base">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
