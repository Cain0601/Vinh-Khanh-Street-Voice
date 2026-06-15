'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Camera, Loader2, ScanLine, X } from 'lucide-react'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan?: (data: string) => void
}

export default function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }

    setScanning(false)
    setCameraReady(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    const startCamera = async () => {
      try {
        setError(null)
        setCameraReady(false)
        setScanning(true)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
          setCameraReady(true)
        }
      } catch (err) {
        if (cancelled) return
        setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
        setScanning(false)
        setCameraReady(false)
        console.error('Camera error:', err)
      }
    }

    startCamera()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [isOpen, stopCamera])

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/85 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-zinc-950 text-white shadow-2xl sm:h-[86dvh] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              QR scanner
            </p>
            <h2 className="text-lg font-semibold text-white">Quét mã QR</h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Đóng trình quét QR"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 active:scale-95"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              cameraReady ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_34%,rgba(0,0,0,0.58)_35%,rgba(0,0,0,0.78)_100%)]" />

          {!cameraReady && !error && (
            <div className="absolute inset-0 grid place-items-center bg-zinc-950">
              <div className="flex max-w-[260px] flex-col items-center text-center">
                <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  {scanning ? (
                    <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
                  ) : (
                    <Camera className="h-8 w-8" aria-hidden="true" />
                  )}
                </div>
                <p className="font-medium text-white">Đang khởi động camera...</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Giữ điện thoại gần mã QR và cho phép trình duyệt dùng camera.
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-10">
            <div className="relative aspect-square w-full max-w-[280px]">
              <div className="absolute inset-0 rounded-[28px] border border-white/25 bg-white/[0.03] shadow-[0_0_70px_rgba(16,185,129,0.18)]" />
              <div className="absolute left-0 top-0 h-14 w-14 rounded-tl-[28px] border-l-[4px] border-t-[4px] border-emerald-400" />
              <div className="absolute right-0 top-0 h-14 w-14 rounded-tr-[28px] border-r-[4px] border-t-[4px] border-emerald-400" />
              <div className="absolute bottom-0 left-0 h-14 w-14 rounded-bl-[28px] border-b-[4px] border-l-[4px] border-emerald-400" />
              <div className="absolute bottom-0 right-0 h-14 w-14 rounded-br-[28px] border-b-[4px] border-r-[4px] border-emerald-400" />
              {cameraReady && (
                <div className="absolute left-6 right-6 top-1/2 h-px bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.95)]" />
              )}
            </div>
          </div>

          {error && (
            <div className="absolute inset-0 grid place-items-center bg-zinc-950/95 p-6">
              <div className="max-w-sm rounded-2xl border border-red-400/20 bg-red-950/70 p-5 text-center shadow-2xl">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-400/10 text-red-300">
                  <AlertCircle className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="font-semibold text-white">Không mở được camera</p>
                <p className="mt-2 text-sm leading-6 text-red-100/80">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-zinc-950 px-4 py-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-zinc-300">
            <ScanLine className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>Đưa mã QR vào giữa khung để hệ thống nhận diện.</span>
          </div>
          <button
            onClick={handleClose}
            className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-[0.99]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
