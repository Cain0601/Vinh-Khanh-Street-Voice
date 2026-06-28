 'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeroSectionProps {
  defaultQuery?: string
}

export default function HeroSection({ defaultQuery = 'phở ẩm thực Vĩnh Khánh' }: HeroSectionProps) {
  const [query, setQuery] = useState(defaultQuery)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/map?search=${encodeURIComponent(query)}`)
    }
  }

  const t = useTranslation();
  return (
    <div className="w-full bg-linear-to-b from-slate-800 to-slate-900 px-4 py-6 border-b border-slate-700">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-lg md:text-2xl font-bold text-white mb-2">
          {t.home.hero.titlePrefix} <span className="text-emerald-500">{query}</span>?
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mb-4">{t.home.hero.subtitle}</p>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={t.home.hero.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-emerald-500 focus:outline-none text-sm md:text-base"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
