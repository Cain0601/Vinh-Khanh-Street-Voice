'use client'

import { useState, useRef, useEffect } from 'react'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan?: (data: string) => void
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!isOpen || scanning) return

    const startCamera = async () => {
      try {
        setError(null)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setScanning(true)
        }
      } catch (err) {
        setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
        console.error('Camera error:', err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
        setScanning(false)
      }
    }
  }, [isOpen, scanning])

  const handleClose = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setScanning(false)
    }
    onClose()
  }

  const handleMockScan = () => {
    // Mock QR scan result
    const mockQRData = 'https://foodtour.example.com/poi/123'
    console.log('Scanned QR:', mockQRData)
    onScan?.(mockQRData)
    alert('✅ QR Scanned: ' + mockQRData)
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-mobile mx-auto bg-slate-900 rounded-lg overflow-hidden shadow-2xl flex flex-col h-screen max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Quét mã QR</h2>
          <button
            onClick={handleClose}
            className="text-2xl text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {scanning && videoRef.current ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* QR Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-emerald-500 rounded-lg shadow-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">📹</div>
              <p className="text-slate-400">Đang khởi động camera...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
              <div className="bg-red-900 text-white p-4 rounded-lg text-center max-w-xs">
                <p className="mb-2">❌ Lỗi</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t border-slate-700 px-4 py-4 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium text-sm"
          >
            Đóng
          </button>
          <button
            onClick={handleMockScan}
            className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium text-sm"
          >
            Mô phỏng Scan
          </button>
        </div>
      </div>
    </div>
  )
}
