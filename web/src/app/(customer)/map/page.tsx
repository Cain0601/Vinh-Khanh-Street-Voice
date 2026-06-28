'use client'

import { Suspense, type RefObject, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'
import { useTranslation } from '@/i18n'
import PoiAudioDrawer from '@/components/Map/PoiAudioDrawer'
import { usePoiAudioQueue } from '@/hooks/usePoiAudioQueue'

const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => <div className="h-80 bg-slate-800" />,
})

function MapPageContent() {
  const [internalUserPos, setInternalUserPos] = useState<[number, number] | null>(null)
  const connectionRef = useRef<HubConnection | null>(null)
  const {
    currentPoi,
    queue,
    currentIndex,
    isPlaying,
    audioRef,
    currentTime,
    duration,
    enqueue,
    skip,
    play,
    pause,
    clearQueue,
  } = usePoiAudioQueue()

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('ft_token='))
      ?.split('=')[1]

    const hubUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5190') + '/hubs/location'
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token || '' })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build()

    conn
      .start()
      .then(() => console.log('Connected to LocationHub (Map page)'))
      .catch((err) => console.error('SignalR connection error:', err))

    connectionRef.current = conn

    return () => {
      conn.stop()
    }
  }, [])

  const sendLocation = (lat: number, lng: number) => {
    if (!connectionRef.current) return

    connectionRef.current.invoke('SendLocation', lat, lng).catch((err) => {
      console.error('Error sending location:', err)
    })
  }

  return (
    <div className="relative h-[calc(100dvh-60px)] overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <MapView
          userPos={internalUserPos}
          pois={[]}
          onTriggerAudio={enqueue}
          onMapClick={(lat, lng) => {
            setInternalUserPos([lat, lng])
            sendLocation(lat, lng)
          }}
        />
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
        audioRef={audioRef as RefObject<HTMLAudioElement>}
        currentTime={currentTime}
        duration={duration}
      />
    </div>
  )
}

export default function MapPage() {
  const t = useTranslation()

  return (
    <Suspense
      fallback={
        <div className="h-screen bg-slate-900 flex items-center justify-center text-white">
          {t.map.loading}
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  )
}
