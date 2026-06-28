'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { Play, Pause, MapPinned, Home } from 'lucide-react'
import Link from 'next/link'

interface PoiDetailProps {
  id: string
  name: string
  description?: string
  mediaUrl?: string[]
  category: string
  address: string
  distance: number
  audioUrl?: string
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
}

export default function PoiDetail({
  id,
  name,
  description,
  mediaUrl,
  category,
  address,
  distance,
  audioUrl,
  isBookmarked,
  onBookmarkToggle,
}: PoiDetailProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const t = useTranslation();
  useEffect(() => {
    const audio = audioRef.current

    if (!audio) return

    const updateProgress = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)

      if (audio.duration) {
        setAudioProgress(
          (audio.currentTime / audio.duration) * 100
        )
      }
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateProgress)

    return () => {
      audio.removeEventListener(
        'timeupdate',
        updateProgress
      )
      audio.removeEventListener(
        'loadedmetadata',
        updateProgress
      )
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current

    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }

    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const coverImage =
    mediaUrl && mediaUrl.length > 0
      ? mediaUrl
      : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/85 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-zinc-950 text-white shadow-2xl sm:h-[86dvh] sm:rounded-2xl">
      {/* Hero Section */}
      <div className="relative h-[45vh] overflow-hidden">
        <img
          src={coverImage as string}
          alt={name}
          className="
          w-full
          h-full
          object-cover
          "
        />

        <div
          className="
          absolute inset-0
          bg-linear-to-t
          from-black
          via-black/40
          to-transparent
          "
        />

        <div className="absolute bottom-6 left-6 right-6">
          <div className="mb-2">
            <span
              className="
              px-3 py-1
              rounded-full
              bg-emerald-500/20
              border border-emerald-500/30
              text-emerald-400
              text-sm
              "
            >
              {category}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-2">
            {name}
          </h1>

          <p className="text-slate-300">
            📍 {distance.toFixed(1)} km
          </p>
        </div>
      </div>

      {/* Bookmark button */}
      {onBookmarkToggle && (
        <button
          onClick={onBookmarkToggle}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      )}

      <div className="px-5 pb-10 -mt-8 relative z-10 overflow-y-auto">
        {/* Audio Player */}
        {audioUrl && (
          <div
            className="
            backdrop-blur-xl
            bg-white/10
            border border-white/10
            rounded-3xl
            p-5
            shadow-2xl
            mb-6
            "
          >
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
            />
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className=" h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center hover:scale-105 transition " >
                {isPlaying ? ( 
                  <Pause size={26} /> 
                ) : (
                  <Play size={26} />
                )}
              </button>
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {t.poiDetail.audioGuide}
                </p>
                <p className="text-slate-400 text-sm">
                  {t.poiDetail.audioDescription}
                </p>
                </div>
              </div>
            <div className="mt-5">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="
                  h-full
                  bg-linear-to-r
                  from-emerald-400
                  to-green-500
                  "
                  style={{
                    width: `${audioProgress}%`,
                  }}
                />
              </div>

              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div
            className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-3xl
            p-5
            mb-6
            "
          >
            <h2 className="font-semibold text-xl mb-3">
              {t.poiDetail.intro}
            </h2>

            <p className="text-slate-300 leading-7">
              {description}
            </p>
          </div>
        )}

        {/* Address */}
        <div
          className="
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          rounded-3xl
          p-5
          mb-6
          "
        >
          <h2 className="font-semibold text-xl mb-3">
            {t.poiDetail.address}
          </h2>

          <p className="text-slate-300">
            {address}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/map?poiId=${encodeURIComponent(id)}`}
            className="
            bg-emerald-500
            hover:bg-emerald-600
            rounded-2xl
            py-4
            font-semibold
            flex
            items-center
            justify-center
            gap-2
            transition
            "
          >
            <MapPinned size={20} />
            {t.poiDetail.viewMap}
          </Link>

          <Link
            href="/"
            className="
            bg-white/10
            border border-white/10
            hover:bg-white/20
            rounded-2xl
            py-4
            font-semibold
            flex
            items-center
            justify-center
            gap-2
            transition
            "
          >
            <Home size={20} />
            {t.poiDetail.backHome}
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}
