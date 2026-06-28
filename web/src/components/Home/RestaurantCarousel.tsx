 'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'

// Fallback placeholder image used when a restaurant does not provide one
const placeholderImg = 'https://via.placeholder.com/300x200?text=Restaurant'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Heart, Star, MapPin } from 'lucide-react'
// Minimal POI type used for the carousel list view
interface Poi {
  id: string
  name?: string
  mediaUrl?: string
  category?: string
  rating?: number
  distance?: number
  // allow extra fields
  [key: string]: any
}

/**
 * Props for the carousel. We only need a subset of the full POI fields for the
 * list view, so we accept a `Pick` of the `Poi` type.
 */
interface RestaurantCarouselProps {
  restaurants: Pick<
    Poi,
    'id' | 'name' | 'mediaUrl' | 'category' | 'rating' | 'distance'
  >[]
  /** Set of bookmarked POI ids, provided by the parent page. */
  bookmarkedIds?: Set<string>
  /** Callback to toggle bookmark state via API. */
  onToggleBookmark?: (id: string) => void
}

export default function RestaurantCarousel({
  restaurants,
  bookmarkedIds = new Set(),
  onToggleBookmark,
}: RestaurantCarouselProps) {
  // Local UI state for optimistic bookmark toggle when API callback is not provided
  const [localBookmarks, setLocalBookmarks] = useState<Set<string>>(new Set())

  const isBookmarked = (id: string) => {
    if (bookmarkedIds.has(id)) return true
    return localBookmarks.has(id)
  }

  const handleToggle = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleBookmark) {
      onToggleBookmark(id)
    } else {
      const newSet = new Set(localBookmarks)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      setLocalBookmarks(newSet)
    }
  }

  const t = useTranslation();
  return (
    <div className="w-full px-0 md:px-4 py-6 border-b border-slate-700">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-white mb-4">{t.home.restaurantCarousel.title}</h2>

        <div className="flex gap-4 overflow-x-auto pb-2 px-4 snap-x snap-mandatory">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/pois/${restaurant.id}`}
              className="shrink-0 w-64 snap-start group"
            >
              <div className="rounded-lg overflow-hidden bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-all">
                {/* Image */}
                <div className="relative h-40 md:h-48 bg-slate-700 overflow-hidden">
                  <img
                    src={restaurant.mediaUrl ?? placeholderImg}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23334155" width="300" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="24">🍴</text></svg>'
                    }}
                  />
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggle(e, restaurant.id)}
                    className={cn(
                      'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      isBookmarked(restaurant.id)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900/50 text-slate-300 hover:bg-slate-900/80'
                    )}
                  >
                    <Heart className={cn('h-4 w-4', isBookmarked(restaurant.id) ? 'text-white' : 'text-slate-300')} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="text-sm md:text-base font-semibold text-white truncate mb-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 mb-2">{restaurant.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-slate-300 flex items-center">
                      <Star className="h-4 w-4 text-amber-400 mr-1 inline-block" /> {restaurant.rating}
                    </span>
                    <span className="text-xs md:text-sm text-slate-400 flex items-center">
                      <MapPin className="h-4 w-4 text-emerald-400 mr-1 inline-block" /> {restaurant.distance} km
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
