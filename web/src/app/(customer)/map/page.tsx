'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/Layout/Header'
import MapFilters from '@/components/Map/MapFilters'
import RestaurantList from '@/components/Map/RestaurantList'
import PoiAudioDrawer from '@/components/Map/PoiAudioDrawer'
import { usePoiAudioQueue } from '@/hooks/usePoiAudioQueue'

const MapView = dynamic(() => import('@/components/Map/MapView'), { ssr: false, loading: () => <div className="h-80 bg-slate-800" /> })

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
  {
    id: '6',
    name: 'Cà Phê Sáng',
    image: 'https://via.placeholder.com/300x200?text=Ca+Phe',
    category: 'Cà phê',
    rating: 4.7,
    distance: 0.7,
  },
]

const categoryMap: Record<string, string> = {
  all: 'Tất cả',
  pho: 'Phở',
  ga: 'Gà',
  com: 'Cơm',
  'banh-mi': 'Bánh Mì',
  coffee: 'Cà phê',
}

function MapPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showList, setShowList] = useState(!!initialSearch)

  const { currentPoi, queue, currentIndex, isPlaying, audioRef, enqueue, skip, play, pause, clearQueue } = usePoiAudioQueue();

  // Filter restaurants based on search and category
  const filteredRestaurants = useMemo(() => {
    return mockRestaurants.filter((restaurant) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        activeFilter === 'all' || restaurant.category.toLowerCase().includes(categoryMap[activeFilter].toLowerCase())

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowList(true)
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col relative bg-slate-900">
      {/* Header */}
      <Header title="Bản đồ" showBack onBack={() => router.push("/home")} />

      {/* Search Input */}
      {/* <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Tìm quán ăn gần đây..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowList(true)}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-emerald-500 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>
      </div> */}

      {/* Filters */}
      {/* {!showList && <MapFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />} */}

      {/* Map or List View */}
      {showList ? (
        <RestaurantList
          restaurants={filteredRestaurants}
          isVisible={showList}
          onClose={() => {
            setShowList(false)
            setSearchQuery('')
          }}
        />
      ) : (
        <div className="flex-1 relative bg-slate-800">
          <div className="absolute inset-0">
            <MapView userPos={null} pois={[]} onTriggerAudio={enqueue} onMapClick={() => {}} />
          </div>
          
          <PoiAudioDrawer 
            isOpen={queue.length > 0} 
            onClose={clearQueue} 
            currentPoi={currentPoi} 
            queuePois={queue} 
            currentIndex={currentIndex}
            isPlaying={isPlaying} 
            onSkip={skip} 
            onPlay={play} 
            onPause={pause} 
            audioRef={audioRef}
          />
          <div className="relative z-10 p-4">
            <div className="text-white">
              <h2 className="text-xl font-bold">Bản đồ Vĩnh Khánh</h2>
              <p className="text-slate-400 text-sm">Hiển thị {filteredRestaurants.length} quán trong khu vực</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-900 flex items-center justify-center text-white">Đang tải bản đồ...</div>}>
      <MapPageContent />
    </Suspense>
  )
}
