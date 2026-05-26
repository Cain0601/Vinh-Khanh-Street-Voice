"use client"

import { useEffect, useRef, useState } from 'react'

type Position = { lat: number; lng: number }

export default function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  function getCurrent(options?: PositionOptions) {
    return new Promise<Position>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'))
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setPosition(p)
          setError(null)
          resolve(p)
        },
        (err) => {
          setError(err.message)
          reject(err)
        },
        options
      )
    })
  }

  function startWatch(successCb?: (p: Position) => void, options?: PositionOptions) {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return null
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(p)
        setError(null)
        if (successCb) successCb(p)
      },
      (err) => {
        setError(err.message)
      },
      options
    )
    watchIdRef.current = id
    return id
  }

  function stopWatch() {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  return { position, error, getCurrent, startWatch, stopWatch }
}
