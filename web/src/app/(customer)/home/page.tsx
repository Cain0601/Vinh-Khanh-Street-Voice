'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { getPois, getBookmarks, toggleBookmark } from '@/lib/api'
import HeroSection from '@/components/Home/HeroSection'
import RestaurantCarousel from '@/components/Home/RestaurantCarousel'
import MapPreviewCard from '@/components/Home/MapPreviewCard'
import Header from '@/components/Layout/Header'

// State will hold POIs fetched from the backend
interface HomePoi {
  id: string
  name: string
  image?: string
  category: string
  rating: number
  distance: number
}

const placeholderImg = 'https://via.placeholder.com/300x200?text=Restaurant'

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<HomePoi[]>([])
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch POIs on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const res = await getPois()
      if (res.success && Array.isArray(res.data)) {
        const data = res.data as any[]
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.title ?? 'Untitled',
          image: p.image ?? placeholderImg,
          category: p.categoryId ?? 'Other',
          rating: p.rating ?? 0,
          distance: p.distance ?? 0,
        }))
        setRestaurants(mapped)
        setError(null)
      } else {
        setError(res.message ?? t.homePage.errorLoading)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Load bookmarks on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      const res = await getBookmarks()
      if (res.success && Array.isArray(res.data)) {
        setBookmarks(new Set(res.data as string[]))
      }
    }
    loadBookmarks()
  }, [])

  const handleToggleBookmark = async (id: string) => {
    const newSet = new Set(bookmarks)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setBookmarks(newSet)
    await toggleBookmark(id)
  }

  const t = useTranslation();
  return (
    <div className="flex flex-col pb-28 px-4">
      <Header />

      <main className="w-full max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mt-4">
          <HeroSection />
        </div>

        {/* Restaurant Carousel */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center text-zinc-400">{t.homePage.loading}</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <RestaurantCarousel
              restaurants={restaurants}
              bookmarkedIds={bookmarks}
              onToggleBookmark={handleToggleBookmark}
            />
          )}
        </div>

        {/* Map Preview */}
        <div className="mt-6 mb-12">
          <MapPreviewCard />
        </div>
      </main>
    </div>
  )
}
