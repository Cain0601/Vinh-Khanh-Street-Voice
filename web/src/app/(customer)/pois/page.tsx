'use client'

import PoiCard from '@/components/Poi/PoiCard'
import Header from '@/components/Layout/Header'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

export default function PoisPage() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

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
      <Header title="All Places" showBack onBack={() => router.back()} />

      <div className="px-4 space-y-3">
        {mockPois.map((poi) => (
          <PoiCard
            key={poi.id}
            {...poi}
            isBookmarked={bookmarks.has(poi.id)}
            onBookmarkToggle={toggleBookmark}
          />
        ))}
      </div>
    </div>
  )
}
