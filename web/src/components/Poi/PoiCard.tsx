'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import Badge from '@/components/Common/Badge'
import IconButton from '@/components/Common/IconButton'

interface PoiCardProps {
  id: string
  name: string
  image?: string
  category: string
  rating?: number
  distance?: number
  isBookmarked?: boolean
  onBookmarkToggle?: (id: string) => void
}

export default function PoiCard({
  id,
  name,
  image,
  category,
  rating,
  distance,
  isBookmarked = false,
  onBookmarkToggle,
}: PoiCardProps) {
  return (
    <div className="relative">
      <Link href={`/customer/pois/${id}`}>
        <div className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-700 transition group">
          {/* Image */}
          <div className="relative h-40 bg-slate-700 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <h3 className="font-semibold text-white line-clamp-2">{name}</h3>

            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" size="sm">
                {category}
              </Badge>
              {rating && (
                <div className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  ⭐ {rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Distance */}
            {distance !== undefined && (
              <div className="text-xs text-slate-400">📍 {distance.toFixed(1)} km</div>
            )}
          </div>
        </div>
      </Link>

      {/* Bookmark Button - Positioned absolutely outside the link */}
      {onBookmarkToggle && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBookmarkToggle(id)
            }}
          >
            <IconButton
              icon={isBookmarked ? '❤️' : '🤍'}
              size="sm"
              variant="secondary"
            />
          </button>
        </div>
      )}
    </div>
  )
}
