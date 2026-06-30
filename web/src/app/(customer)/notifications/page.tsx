'use client'

import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Layout/Header'
import EmptyState from '@/components/Common/EmptyState'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, XCircle, Bell } from 'lucide-react'
import { cn } from '@/lib/cn'
import Link from 'next/link'
import { useTranslation } from '@/i18n'

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

export default function NotificationsPage() {
  const router = useRouter()
  const t = useTranslation()
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

  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
        const parsed = stored ? (JSON.parse(stored) as AppNotification[]) : []
        const next = Array.isArray(parsed) ? normalizeNotifications(parsed) : []
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(next))
        setNotifications(next)
      } catch {
        setNotifications([])
      }
    }

    window.addEventListener(NOTIFICATION_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  )

  const markAllRead = () => {
    const next = notifications.map((item) => ({ ...item, read: true }))
    setNotifications(next)
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(NOTIFICATION_EVENT))
  }

  const markRead = (id: string) => {
    const next = notifications.map((item) => (item.id === id ? { ...item, read: true } : item))
    setNotifications(next)
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(NOTIFICATION_EVENT))
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header title={t.nav.notifications} showBack onBack={() => router.push("/home")} />

      <div className="flex-1 px-4 py-4 pb-24 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {t.notifications.title}
            </h2>
            <p className="text-sm text-slate-400">
              {unreadCount > 0
                ? t.notifications.unreadCount.replace('{count}', unreadCount.toString())
                : t.notifications.allRead}
            </p>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={notifications.length === 0}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            {t.notifications.markAllRead}
          </button>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title={t.notifications.empty.title}
            description={t.notifications.empty.description}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const approved = item.status === 'APPROVED'
              const Icon = approved ? CheckCircle2 : XCircle

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item.id)}
                  className={cn(
                    'w-full text-left rounded-3xl border p-5 transition-all hover:scale-[1.01]',
                    item.read
                      ? 'border-slate-800 bg-slate-900/70'
                      : 'border-emerald-500/30 bg-emerald-500/10',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                        approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400',
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white text-[17px]">{item.title}</p>
                        {!item.read && (
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-300 leading-relaxed">{item.message}</p>

                      {/* Phần từ chối */}
                      {item.reason && (
                        <p className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          {t.notifications.reasonPrefix} <span className="font-medium">{item.reason}</span>
                        </p>
                      )}

                      {/* Phần duyệt thành công */}
                      {!item.reason && approved && (
                        <div className="mt-4">
                          <Link
                            href="/owner"
                            onClick={(e) => e.stopPropagation()}
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.985]"
                          >
                            <span>{t.notifications.approved.goToManagement}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}