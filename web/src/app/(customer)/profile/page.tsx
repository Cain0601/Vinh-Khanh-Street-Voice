'use client'

import Header from '@/components/Layout/Header'
import Button from '@/components/Common/Button'
import Badge from '@/components/Common/Badge'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const [user] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    avatar: '👨‍💼',
    bookmarks: 12,
    reviews: 5,
    joinedDate: 'January 2024',
  })

  return (
    <div className="space-y-4">
      <Header title="Profile" showBack onBack={() => router.back()} />

      <div className="px-4 space-y-4">
        {/* User Card */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-slate-800 rounded-xl p-4 border border-emerald-500/30">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-5xl">{user.avatar}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-xs text-slate-400">{user.joinedDate}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <span>📧</span>
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>📞</span>
              <span>{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{user.bookmarks}</div>
            <div className="text-xs text-slate-400 mt-1">Bookmarks</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{user.reviews}</div>
            <div className="text-xs text-slate-400 mt-1">Reviews</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => router.push('/customer/profile/edit')}
          >
            Edit Profile
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => router.push('/customer/settings')}
          >
            Settings
          </Button>
        </div>

        {/* Menu Links */}
        <div className="space-y-2">
          {[
            { icon: '📋', label: 'My Reviews', href: '#' },
            { icon: '❤️', label: 'Saved Places', href: '/customer/bookmarks' },
            { icon: '⚙️', label: 'Settings', href: '/customer/settings' },
            { icon: '📞', label: 'Support', href: '#' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => window.location.href = item.href}
              className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 p-3 rounded-lg transition text-left"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 font-medium text-slate-300">{item.label}</span>
              <span className="text-slate-500">›</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button variant="danger" size="md" fullWidth>
          Logout
        </Button>
      </div>
    </div>
  )
}
