"use client"

import { useEffect, useState, type ElementType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import QRScanner from '@/components/QR/QRScanner'
import { Home as HomeIcon, MapPin as MapIcon, Bell as BellIcon, User as UserIcon, QrCode as QrCodeIcon } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { HubConnectionBuilder, LogLevel, type HubConnection } from '@microsoft/signalr'

type AppNotification = {
  id: string
  requestId: string
  type: string
  status: 'APPROVED' | 'REJECTED'
  title: string
  message: string
  reason?: string | null
  createdAt: string
  read: boolean
}

const NOTIFICATION_STORAGE_KEY = 'ft_notifications'
const NOTIFICATION_EVENT = 'ft-notifications-updated'

function getNotificationKey(item: Pick<AppNotification, 'requestId' | 'type' | 'status'>) {
  return `${item.requestId}:${item.type}:${item.status}`
}

function normalizeNotifications(items: AppNotification[]) {
  const seen = new Set<string>()

  return items.filter((item) => {
    const key = getNotificationKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

interface NavItem {
  labelKey: string
  label: string
  href: string
  icon: ElementType
  activePattern?: RegExp
}

const navItems: NavItem[] = [
  { labelKey: 'home', label: 'Home', href: '/home', icon: HomeIcon, activePattern: /^\/home\/?$/ },
  { labelKey: 'map', label: 'Map', href: '/map', icon: MapIcon, activePattern: /^\/map/ },
  { labelKey: 'notifications', label: 'Notifications', href: '/notifications', icon: BellIcon, activePattern: /^\/notifications/ },
  { labelKey: 'profile', label: 'Profile', href: '/profile', icon: UserIcon, activePattern: /^\/profile/ },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [qrOpen, setQrOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      const parsed = stored ? (JSON.parse(stored) as AppNotification[]) : []
      return Array.isArray(parsed) ? normalizeNotifications(parsed) : []
    } catch {
      return []
    }
  })
  const t = useTranslation();
  const navTranslations = t as { nav?: Record<string, string> }

  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return item.activePattern.test(pathname)
    }
    return pathname.startsWith(item.href)
  }

  // Split nav items into left and right for floating center button
  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)
  const unreadCount = notifications.filter((item) => !item.read).length

  function getNotificationKey(item: Pick<AppNotification, 'requestId' | 'type' | 'status'>) {
    return `${item.requestId}:${item.type}:${item.status}`
  }

  function normalizeNotifications(items: AppNotification[]) {
    const seen = new Set<string>()
    return items.filter((item) => {
      const key = getNotificationKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  const pushNotification = (incoming: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications((prev) => {
      let current: AppNotification[] = prev

      // Lấy dữ liệu mới nhất từ localStorage để tránh race condition
      try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
        if (stored) {
          const storedItems = JSON.parse(stored) as AppNotification[]
          current = Array.isArray(storedItems) ? normalizeNotifications(storedItems) : prev
        }
      } catch {
        current = prev
      }

      const incomingKey = getNotificationKey(incoming)

      // Nếu đã tồn tại thì không thêm nữa
      if (current.some((item) => getNotificationKey(item) === incomingKey)) {
        return current
      }

      const nextItem: AppNotification = {
        ...incoming,
        id: `${incoming.requestId}-${incoming.status}-${Date.now()}`, // Tốt hơn là thêm timestamp
        createdAt: new Date().toISOString(),
        read: false,
      }

      const next = [nextItem, ...current].slice(0, 20) // Giới hạn 20 thông báo
      const normalizedNext = normalizeNotifications(next) // Đảm bảo sạch

      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(normalizedNext))
      window.dispatchEvent(new Event(NOTIFICATION_EVENT))

      return normalizedNext
    })
  }

  useEffect(() => {
    const onNotificationUpdate = () => {
      try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
        if (!stored) {
          setNotifications([])
          return
        }

        const parsed = JSON.parse(stored) as AppNotification[]
        const next = Array.isArray(parsed) ? normalizeNotifications(parsed) : []
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(next))
        setNotifications(next)
      } catch {
        setNotifications([])
      }
    }

    window.addEventListener(NOTIFICATION_EVENT, onNotificationUpdate)

    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('ft_token='))
      ?.split('=')[1]

    if (!token) {
      return () => window.removeEventListener(NOTIFICATION_EVENT, onNotificationUpdate)
    }

    const hubUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5190') + '/hubs/location'
    const conn: HubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token || '' })
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect()
      .build()

    conn.on('ModerationRequestStatusChanged', (event: { requestId?: string; type?: string; status?: string; title?: string; message?: string; reason?: string | null }) => {
      pushNotification({
        requestId: event?.requestId || `${Date.now()}`,
        type: event?.type || 'MODERATION',
        status: event?.status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
        title: event?.title || 'Cập nhật yêu cầu',
        message: event?.message || '',
        reason: event?.reason || null,
      })
    })

    conn.start().catch(() => {})

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, onNotificationUpdate)
      conn.stop().catch(() => {})
    }
  }, [])

  return (
    <>
      <QRScanner isOpen={qrOpen} onClose={() => setQrOpen(false)} />
      
      <nav className="h-15 z-20 fixed bottom-0 left-0 right-0 max-w-lg bg-slate-800 border-t border-slate-700 flex justify-between items-center max-w-mobile mx-auto px-2 py-2 gap-1">
        {/* Left Items */}
        <div className="flex-1 flex justify-around">
          {leftItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors gap-1 rounded-lg flex-1',
                isActive(item)
                  ? 'text-emerald-500 bg-slate-700/50'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <span className="text-xl"><item.icon className="h-6 w-6" /></span>
              {item.href === '/notifications' && unreadCount > 0 ? (
                <span className="absolute right-5 top-2 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
              <span className="truncate text-xs">{navTranslations.nav?.[item.labelKey] ?? item.label}</span>
            </Link>
          ))}
        </div>

        {/* Floating QR Button */}
        <button
          onClick={() => setQrOpen(true)}
          className="shrink-0 w-14 h-14 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center -mt-8 border-4 border-slate-800 text-2xl font-bold"
        >
          <QrCodeIcon className="h-6 w-6" />
        </button>

        {/* Right Items */}
        <div className="flex-1 flex justify-around">
          {rightItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors gap-1 rounded-lg flex-1',
                isActive(item)
                  ? 'text-emerald-500 bg-slate-700/50'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <span className="text-xl"><item.icon className="h-6 w-6" /></span>
              {item.href === '/notifications' && unreadCount > 0 ? (
                <span className="absolute right-5 top-2 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
              <span className="truncate text-xs">{navTranslations.nav?.[item.labelKey] ?? item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
