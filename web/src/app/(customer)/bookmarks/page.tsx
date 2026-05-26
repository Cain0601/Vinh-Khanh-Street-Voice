'use client'

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import PoiCard from '@/components/Poi/PoiCard'
import EmptyState from '@/components/Common/EmptyState'
import Button from '@/components/Common/Button'
import { useRouter } from 'next/navigation'

// Mock bookmarked POIs
const mockBookmarkedPois = [
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
    id: '3',
    name: 'Banh Mi House',
    image: 'https://via.placeholder.com/300x200?text=Banh+Mi',
    category: 'Sandwich',
    rating: 4.6,
    distance: 0.8,
    reviewCount: 156,
  },
]

export default function BookmarksPage() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(mockBookmarkedPois.map((p) => p.id))
  )

  const toggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarks)
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id)
    } else {
      newBookmarks.add(id)
    }
    setBookmarks(newBookmarks)
  }

  const displayedPois = mockBookmarkedPois.filter((p) => bookmarks.has(p.id))

  return (
    <div className="space-y-4">
      <Header title="Bookmarks" showBack onBack={() => router.back()} />

      <div className="px-4 space-y-4">
        {displayedPois.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">{displayedPois.length} saved places</p>
            {displayedPois.map((poi) => (
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
            icon="❤️"
            title="No bookmarks yet"
            description="Save your favorite places to visit them later"
            action={{
              label: 'Explore Places',
              href: '/customer/search',
            }}
          />
        )}
      </div>
    </div>
  )
}
