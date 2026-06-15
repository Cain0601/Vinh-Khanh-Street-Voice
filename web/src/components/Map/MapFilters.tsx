'use client'

import { cn } from '@/lib/cn'

interface MapFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const filters = [
  { id: 'all', label: 'Tất cả', icon: '📍' },
  { id: 'pho', label: 'Phở', icon: '🍜' },
  { id: 'ga', label: 'Gà', icon: '🍗' },
  { id: 'com', label: 'Cơm', icon: '🍚' },
  { id: 'banh-mi', label: 'Banh Mi', icon: '🥖' },
  { id: 'coffee', label: 'Cà phê', icon: '☕' },
]

export default function MapFilters({ activeFilter, onFilterChange }: MapFiltersProps) {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border snap-start',
              activeFilter === filter.id
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500'
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
