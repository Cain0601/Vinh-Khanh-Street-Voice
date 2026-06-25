'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Camera, Loader2, ScanLine, X, Image as ImageIcon } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { useTranslation } from '@/i18n';
import { useRouter } from 'next/navigation';

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan?: (data: string) => void
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const t = useTranslation();
  
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isStoppingRef = useRef(false)
  const router = useRouter();

  // Dừng scanner
  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current || !scannerRef.current) {
      setIsScanning(false)
      setCameraReady(false)
      return
    }

    isStoppingRef.current = true
    try {
      if (scannerRef.current.getState() > 1) {
        await scannerRef.current.stop()
      }
      try {
        await scannerRef.current.clear()
      } catch {}
    } catch (err) {
      console.warn('Error stopping scanner:', err)
    } finally {
      scannerRef.current = null
      isStoppingRef.current = false
      setIsScanning(false)
      setCameraReady(false)
    }
  }, [])

  // Xử lý khi quét thành công
  const handleScanSuccess = useCallback(async (decodedText: string) => {
    console.log('Scanned:', decodedText)
    
    const poiMatch = decodedText.match(/\/poi\/([A-Za-z0-9]{20,})/);
    
    if (poiMatch) {
      const poiId = poiMatch[1];
      await stopScanner();
      
      setTimeout(() => {
        onClose();
        router.push(`/pois/${poiId}`);
      }, 800);
    } else {
      setError('Mã QR không hợp lệ');
    }
  }, [stopScanner, onClose, router, t])

  // Khởi động scanner
  useEffect(() => {
    let active = true

    const startScanner = async () => {
      if (!isOpen) return
      await stopScanner()
      if (!active) return

      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode

      setIsScanning(true)
      setError(null)

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 280, height: 280 } },
          handleScanSuccess,
          () => {} // error callback
        )
        setCameraReady(true)
      } catch (err) {
        if (active) {
          setError(t.qrScanner.errorAccess || 'Không thể mở camera')
          setIsScanning(false)
        }
      }
    }

    if (isOpen) {
      const timer = setTimeout(startScanner, 300)
      return () => {
        active = false
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
    }
  }, [isOpen, stopScanner, handleScanSuccess, t])

  // === SCAN TỪ FILE ẢNH ===
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const imageFile = e.target.files[0]
    
    // Dừng camera trước khi scan file
    await stopScanner()
    setIsProcessingFile(true)
    setError(null)

    let html5QrCode = scannerRef.current

    // Nếu chưa có instance thì tạo mới
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode
    }

    try {
      const result = await html5QrCode.scanFile(imageFile, true) // true = hiển thị ảnh lên element
      console.log('Scanned from file:', result)
      
      await handleScanSuccess(result)
    } catch (err: any) {
      console.error('Scan file error:', err)
      
      let errorMessage = t.qrScanner.noQrFound || 'Không tìm thấy mã QR trong ảnh này'
      
      if (err?.message?.includes('No MultiFormat Readers') || err?.message?.includes('QR code')) {
        errorMessage = 'Không nhận diện được mã QR. Ảnh có thể bị mờ hoặc không đúng định dạng.'
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessingFile(false)
      // Reset input để có thể chọn lại cùng file
      e.target.value = ''
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/85 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-zinc-950 text-white shadow-2xl sm:h-[86dvh] sm:rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              {t.qrScanner.scannerLabel}
            </p>
            <h2 className="text-lg font-semibold text-white">{t.qrScanner.title}</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <div id="qr-reader" className="h-full w-full" />

          {/* Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_34%,rgba(0,0,0,0.58)_35%,rgba(0,0,0,0.78)_100%)]" />

          {!cameraReady && !error && !isProcessingFile && (
            <div className="absolute inset-0 grid place-items-center bg-zinc-950">
              <div className="flex flex-col items-center text-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-400 mb-4" />
                <p className="text-white font-medium">{t.qrScanner.loading}</p>
              </div>
            </div>
          )}

          {/* Loading khi xử lý file */}
          {isProcessingFile && (
            <div className="absolute inset-0 grid place-items-center bg-black/90">
              <div className="flex flex-col items-center text-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-400 mb-4" />
                <p className="text-white font-medium">Đang xử lý ảnh...</p>
              </div>
            </div>
          )}

          {/* Khung scanner */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
            <div className="relative aspect-square w-full max-w-[280px]">
              <div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/60" />
              <div className="absolute left-0 top-0 h-12 w-12 rounded-tl-3xl border-l-4 border-t-4 border-emerald-400" />
              <div className="absolute right-0 top-0 h-12 w-12 rounded-tr-3xl border-r-4 border-t-4 border-emerald-400" />
              <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-3xl border-l-4 border-b-4 border-emerald-400" />
              <div className="absolute bottom-0 right-0 h-12 w-12 rounded-br-3xl border-r-4 border-b-4 border-emerald-400" />
            </div>
          </div>

          {error && (
            <div className="absolute inset-0 grid place-items-center bg-black/90 p-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <p className="text-white font-medium mb-2">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-4 px-6 py-2.5 bg-white text-zinc-900 rounded-2xl font-semibold"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 bg-zinc-950 p-4 space-y-3">
          {/* Nút chọn ảnh từ thư viện */}
          <label className="flex items-center justify-center gap-3 w-full h-12 bg-white/10 hover:bg-white/15 rounded-2xl font-medium text-white cursor-pointer active:scale-[0.98] transition-all">
            <ImageIcon className="w-5 h-5" />
            <span>{t.qrScanner.chooseFromGallery || 'Chọn ảnh từ thư viện'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={onFileChange} 
            />
          </label>

          <button
            onClick={handleClose}
            className="h-11 w-full rounded-2xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 active:scale-[0.99]"
          >
            {t.qrScanner.closeButton}
          </button>
        </div>
      </div>
    </div>
  )
}