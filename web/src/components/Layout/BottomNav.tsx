'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import QRScanner from '@/components/QR/QRScanner'

interface NavItem {
  label: string
  href: string
  icon: string
  activePattern?: RegExp
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/home',
    icon: '🏠',
    activePattern: /^\/home\/?$/,
  },
  {
    label: 'Map',
    href: '/map',
    icon: '🗺️',
    activePattern: /^\/map/,
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: '🔔',
    activePattern: /^\/notifications/,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: '👤',
    activePattern: /^\/profile/,
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [qrOpen, setQrOpen] = useState(false)

  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return item.activePattern.test(pathname)
    }
    return pathname.startsWith(item.href)
  }

  // Split nav items into left and right for floating center button
  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)

  return (
    <>
      <QRScanner isOpen={qrOpen} onClose={() => setQrOpen(false)} />
      
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg bg-slate-800 border-t border-slate-700 flex justify-between items-center max-w-mobile mx-auto px-2 py-2 gap-1">
        {/* Left Items */}
        <div className="flex-1 flex justify-around">
          {leftItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors gap-1 rounded-lg flex-1',
                isActive(item)
                  ? 'text-emerald-500 bg-slate-700/50'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="truncate text-xs">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Floating QR Button */}
        <button
          onClick={() => setQrOpen(true)}
          className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center -mt-8 border-4 border-slate-800 text-2xl font-bold"
        >
          QR
        </button>

        {/* Right Items */}
        <div className="flex-1 flex justify-around">
          {rightItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors gap-1 rounded-lg flex-1',
                isActive(item)
                  ? 'text-emerald-500 bg-slate-700/50'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="truncate text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
