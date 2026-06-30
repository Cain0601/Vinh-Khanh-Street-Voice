'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Layout/Header'
import PoiDetail from '@/components/Poi/PoiDetail'
import { useRouter, useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import api, { getPoi, getBookmarks, toggleBookmark } from '@/lib/api'
import { useUserStore } from "@/store/userStore";
// Minimal POI type matching the backend response used in this page
interface Poi {
  id: string
  title?: string
  summary?: string
  audioUrl?: string
  mediaUrl?: string
  rating?: number
  reviewCount?: number
  address?: string
  contact?: { phoneNumber?: string }
  categoryId?: string
  distance?: number
  // allow additional fields
  [key: string]: any
}

// State for POI data
const initialPoi: Poi | null = null

export default function PoiDetailPage() {
  const { language } = useUserStore();
  const router = useRouter()
  const params = useParams()
  const [poi, setPoi] = useState<Poi | null>(initialPoi)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  const searchParams = useSearchParams()
  const lang = searchParams?.get('lang') ?? language
  const src = searchParams?.get('src')
  const isQr = src === 'qr' || src === 'app' || searchParams?.get('qr') === '1'
  const hasLoggedQr = useRef(false)

  // Fetch POI data
  useEffect(() => {
    const fetchPoi = async () => {
      setLoading(true)
      const res = await getPoi(params.id as string, lang)
      if (res.success && res.data) {
        const poiData = res.data as Poi
        console.log('Fetched POI:', poiData)
        setPoi(poiData)
        setError(null)
        
        // Ghi nhận lượt quét QR nếu truy cập qua QR (tránh ghi đúp ở Strict Mode bằng useRef)
        if (isQr && !hasLoggedQr.current) {
          hasLoggedQr.current = true
          api.post('/analytics/qr-scan', { 
            poiId: poiData.id,
            source: src === 'app' ? 'app' : 'external'
          }).catch(err => {
            console.error('Failed to log QR scan', err)
          })
        }
      } else {
        setError(res.message ?? 'Failed to load POI')
      }
      setLoading(false)
    }
    fetchPoi()
  }, [params.id, lang, isQr])

  // Load bookmarks on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      const res = await getBookmarks()
      if (res.success && res.data) {
        setBookmarks(new Set(res.data as string[]))
      }
    }
    loadBookmarks()
  }, [])

  const isBookmarked = poi ? bookmarks.has(poi.id) : false

  const handleToggleBookmark = async () => {
    if (!poi) return
    // Optimistic UI update
    const newSet = new Set(bookmarks)
    if (newSet.has(poi.id)) newSet.delete(poi.id)
    else newSet.add(poi.id)
    setBookmarks(newSet)
    await toggleBookmark(poi.id)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Header title="" showBack={!isQr} onBack={() => router.back()} />
        <div className="px-4 text-center text-slate-400">Loading...</div>
      </div>
    )
  }

  if (error || !poi) {
    return (
      <div className="space-y-4">
        <Header title="" showBack={!isQr} onBack={() => router.back()} />
        <div className="px-4 text-center text-red-500">{error ?? 'POI not found'}</div>
        <div className="px-4 text-center">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Transform API response to match PoiDetailProps shape
  const detailProps = {
    id: poi.id,
    name: poi.title ?? 'Untitled',
    description: (poi as any).summary ?? '',
    mediaUrl: (poi as any).mediaUrl ?? '',
    category: (poi as any).categoryId ?? 'Other',
    rating: poi.rating ?? 0,
    reviewCount: poi.reviewCount ?? 0,
    address: (poi as any).address ?? '',
    phone: (poi as any).contact?.phoneNumber ?? '',
    hours: (poi as any).hours ?? '',
    menu: [], // No menu data from API yet
    distance: (poi as any).distance ?? 0,
    audioUrl: (poi as any).audioUrl,
  }

  return (
    <div className="space-y-4">
      <Header
        title=""
        showBack={!isQr}
        onBack={() => router.back()}
      />
      {isQr && (
        <div className="px-4 text-sm text-slate-400">Scanned from QR code</div>
      )}
      <div className="px-4">
        <PoiDetail
          {...detailProps}
          isBookmarked={isBookmarked}
          onBookmarkToggle={handleToggleBookmark}
        />
        {isQr && (
          <div className="mt-4 text-center">
            <a
              href={`myapp://poi/${poi.id}`}
              className="px-4 py-2 bg-slate-800 text-white rounded"
            >
              Open in App
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
