'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'

interface Restaurant {
  id: string
  name: string
  image: string
  category: string
  rating: number
  distance: number
}

interface RestaurantListProps {
  restaurants: Restaurant[]
  isVisible: boolean
  onClose: () => void
}

export default function RestaurantList({ restaurants, isVisible, onClose }: RestaurantListProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          Tìm thấy {restaurants.length} quán
        </h3>
        <button
          onClick={onClose}
          className="text-2xl text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Restaurant List */}
      <div className="flex-1 overflow-y-auto">
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 p-4">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/customer/pois/${restaurant.id}`}
                onClick={onClose}
                className="group"
              >
                <div className="rounded-lg overflow-hidden bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-all h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-32 bg-slate-700 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23334155" width="300" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="24">🍴</text></svg>'
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white truncate mb-1">
                        {restaurant.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{restaurant.category}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">⭐ {restaurant.rating}</span>
                      <span className="text-slate-400">{restaurant.distance} km</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-slate-400 text-sm">Không tìm thấy quán nào</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
