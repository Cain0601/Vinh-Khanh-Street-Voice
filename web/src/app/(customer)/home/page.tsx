'use client'

import { useState } from 'react'
import HeroSection from '@/components/Home/HeroSection'
import RestaurantCarousel from '@/components/Home/RestaurantCarousel'
import MapPreviewCard from '@/components/Home/MapPreviewCard'
import Header from '@/components/Layout/Header'

// Mock data - replace with API call
const mockRestaurants = [
  {
    id: '1',
    name: 'Phở Việt Nam Restaurant',
    image: 'https://via.placeholder.com/300x200?text=Pho+Vietnam',
    category: 'Phở',
    rating: 4.8,
    distance: 0.5,
  },
  {
    id: '2',
    name: 'Street Food Corner',
    image: 'https://via.placeholder.com/300x200?text=Street+Food',
    category: 'Street Food',
    rating: 4.5,
    distance: 1.2,
  },
  {
    id: '3',
    name: 'Bánh Mì House',
    image: 'https://via.placeholder.com/300x200?text=Banh+Mi',
    category: 'Bánh Mì',
    rating: 4.6,
    distance: 0.8,
  },
  {
    id: '4',
    name: 'Cơm Chiên Palace',
    image: 'https://via.placeholder.com/300x200?text=Com+Chien',
    category: 'Cơm',
    rating: 4.7,
    distance: 1.5,
  },
  {
    id: '5',
    name: 'Gà Nướng Tây Sơn',
    image: 'https://via.placeholder.com/300x200?text=Ga+Nuong',
    category: 'Gà',
    rating: 4.9,
    distance: 0.3,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col pb-28">
      <Header />

      <main className="w-full max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mt-4">
          <HeroSection />
        </div>

        {/* Restaurant Carousel */}
        <div className="mt-6">
          <RestaurantCarousel restaurants={mockRestaurants} />
        </div>

        {/* Map Preview */}
        <div className="mt-6 mb-12">
          <MapPreviewCard />
        </div>
      </main>
    </div>
  )
}
