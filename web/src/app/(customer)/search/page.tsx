'use client'

import { useState, useMemo } from 'react'
import Button from '@/components/Common/Button'
import Badge from '@/components/Common/Badge'
import PoiCard from '@/components/Poi/PoiCard'
import EmptyState from '@/components/Common/EmptyState'
import Header from '@/components/Layout/Header'
import { useRouter } from 'next/navigation'

const mockCategories = ['All', 'Vietnamese', 'Street Food', 'Sandwich', 'Cafe']
const mockPois = [
  {
    id: '1',
    name: 'Pho Vietnam Restaurant',
    image: 'https://via.placeholder.com/300x200?text=Pho',
    category: 'Vietnamese',
    rating: 4.8,
    distance: 0.5,
    reviewCount: 128,
  },
  {
    id: '2',
    name: 'Street Food Corner',
    image: 'https://via.placeholder.com/300x200?text=Street+Food',
    category: 'Street Food',
    rating: 4.5,
    distance: 1.2,
    reviewCount: 95,
  },
  {
    id: '3',
    name: 'Banh Mi House',
    image: 'https://via.placeholder.com/300x200?text=Banh+Mi',
    category: 'Sandwich',
    rating: 4.6,
    distance: 0.8,
    reviewCount: 156,
  },
  {
    id: '4',
    name: 'Local Cafe',
    image: 'https://via.placeholder.com/300x200?text=Cafe',
    category: 'Cafe',
    rating: 4.3,
    distance: 0.3,
    reviewCount: 89,
  },
]

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  const filteredPois = useMemo(() => {
    return mockPois.filter((poi) => {
      const matchesQuery =
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || poi.category === selectedCategory
      return matchesQuery && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const toggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarks)
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id)
    } else {
      newBookmarks.add(id)
    }
    setBookmarks(newBookmarks)
  }

  return (
    <div className="space-y-4">
      <Header title="Search" showBack onBack={() => router.back()} />

      {/* Search Input */}
      <div className="relative px-4">
        <input
          type="text"
          placeholder="Search restaurants, food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <span className="absolute left-7 top-3.5">🔍</span>
      </div>

      {/* Category Filter */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {mockCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4">
        {filteredPois.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Found {filteredPois.length} results</p>
            {filteredPois.map((poi) => (
              <PoiCard
                key={poi.id}
                {...poi}
                isBookmarked={bookmarks.has(poi.id)}
                onBookmarkToggle={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="No results found"
            description={
              searchQuery
                ? `No restaurants match "${searchQuery}"`
                : 'Try searching for a restaurant or category'
            }
          />
        )}
      </div>
    </div>
  )
}
