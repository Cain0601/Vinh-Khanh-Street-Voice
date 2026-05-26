'use client'

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import PoiDetail from '@/components/Poi/PoiDetail'
import { useRouter, useParams } from 'next/navigation'

// Mock POI data
const mockPoiDetail = {
  id: '1',
  name: 'Pho Vietnam Restaurant',
  description:
    'Authentic Vietnamese pho restaurant with fresh ingredients and traditional recipes. Perfect for breakfast or dinner with family and friends.',
  images: [
    'https://via.placeholder.com/424x300?text=Pho+1',
    'https://via.placeholder.com/424x300?text=Pho+2',
    'https://via.placeholder.com/424x300?text=Pho+3',
  ],
  category: 'Vietnamese',
  rating: 4.8,
  reviewCount: 128,
  address: '123 Main Street, Downtown District',
  phone: '+1 (555) 123-4567',
  hours: 'Mon-Sun 8:00 AM - 10:00 PM',
  menu: [
    { id: '1', name: 'Pho Bo (Beef)', price: '$8.99', category: 'Pho' },
    { id: '2', name: 'Pho Ga (Chicken)', price: '$7.99', category: 'Pho' },
    { id: '3', name: 'Pho Tom (Shrimp)', price: '$9.99', category: 'Pho' },
    { id: '4', name: 'Spring Rolls', price: '$4.99', category: 'Appetizers' },
    { id: '5', name: 'Summer Rolls', price: '$5.99', category: 'Appetizers' },
    { id: '6', name: 'Vietnamese Coffee', price: '$3.99', category: 'Drinks' },
    { id: '7', name: 'Iced Tea', price: '$2.99', category: 'Drinks' },
  ],
  distance: 0.5,
}

export default function PoiDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  const isBookmarked = bookmarks.has(mockPoiDetail.id)

  const toggleBookmark = () => {
    const newBookmarks = new Set(bookmarks)
    if (newBookmarks.has(mockPoiDetail.id)) {
      newBookmarks.delete(mockPoiDetail.id)
    } else {
      newBookmarks.add(mockPoiDetail.id)
    }
    setBookmarks(newBookmarks)
  }

  return (
    <div className="space-y-4">
      <Header title="" showBack onBack={() => router.back()} />

      <div className="px-4">
        <PoiDetail
          {...mockPoiDetail}
          isBookmarked={isBookmarked}
          onBookmarkToggle={toggleBookmark}
        />
      </div>
    </div>
  )
}
