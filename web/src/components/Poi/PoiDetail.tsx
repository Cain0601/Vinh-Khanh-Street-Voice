'use client'

import { useState } from 'react'
import Badge from '@/components/Common/Badge'
import Button from '@/components/Common/Button'
import IconButton from '@/components/Common/IconButton'

interface MenuItem {
  id: string
  name: string
  price: string
  category: string
}

interface PoiDetailProps {
  id: string
  name: string
  description: string
  images: string[]
  category: string
  rating: number
  reviewCount: number
  address: string
  phone: string
  hours: string
  menu: MenuItem[]
  distance: number
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
}

export default function PoiDetail({
  id,
  name,
  description,
  images,
  category,
  rating,
  reviewCount,
  address,
  phone,
  hours,
  menu,
  distance,
  isBookmarked = false,
  onBookmarkToggle,
}: PoiDetailProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  // Group menu by category
  const menuByCategory = menu.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>
  )

  return (
    <div className="space-y-4">
      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
          <img
            src={images[activeImageIndex]}
            alt={`${name} - ${activeImageIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
              {activeImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <button
                onClick={() =>
                  setActiveImageIndex((i) => (i - 1 + images.length) % images.length)
                }
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setActiveImageIndex((i) => (i + 1) % images.length)
                }
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition"
              >
                →
              </button>
            </div>
          )}

          {/* Bookmark Button */}
          {onBookmarkToggle && (
            <button
              onClick={onBookmarkToggle}
              className="absolute top-3 right-3"
            >
              <IconButton
                icon={isBookmarked ? '❤️' : '🤍'}
                size="md"
                variant="secondary"
              />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">{name}</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary">{category}</Badge>
          <div className="text-sm font-medium text-slate-300">
            ⭐ {rating.toFixed(1)} ({reviewCount} reviews)
          </div>
          <div className="text-sm text-slate-400">📍 {distance.toFixed(1)} km</div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-slate-800 rounded-lg p-3 space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <span>📍</span>
          <span className="text-slate-300">{address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>📞</span>
          <a href={`tel:${phone}`} className="text-emerald-500 hover:text-emerald-400">
            {phone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>🕐</span>
          <span className="text-slate-300">{hours}</span>
        </div>
      </div>

      {/* Menu */}
      {menu.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          {Object.entries(menuByCategory).map(([catName, items]) => (
            <div key={catName} className="bg-slate-800 rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedMenu(expandedMenu === catName ? null : catName)
                }
                className="w-full flex items-center justify-between p-3 hover:bg-slate-700 transition"
              >
                <h3 className="font-medium text-white">{catName}</h3>
                <span
                  className={`transition ${
                    expandedMenu === catName ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedMenu === catName && (
                <div className="bg-slate-900/50 border-t border-slate-700 divide-y divide-slate-700">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.name}</p>
                      </div>
                      <p className="font-semibold text-emerald-500">{item.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => window.location.href = `tel:${phone}`}
        >
          Call
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => window.location.href = `https://maps.google.com/?q=${address}`}
        >
          Get Directions
        </Button>
      </div>
    </div>
  )
}
