'use client'

import Header from '@/components/Layout/Header'
import Button from '@/components/Common/Button'
import Badge from '@/components/Common/Badge'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const languages = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className="space-y-4">
      <Header title="Settings" showBack onBack={() => router.back()} />

      <div className="px-4 space-y-4">
        {/* Language */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Language</h3>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-lg transition text-center font-medium ${
                  language === lang.code
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <div>
                <p className="font-medium text-white">Notifications</p>
                <p className="text-xs text-slate-400">Get updates about new places</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex w-12 h-7 items-center rounded-full transition ${
                notifications ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌙</span>
              <div>
                <p className="font-medium text-white">Dark Mode</p>
                <p className="text-xs text-slate-400">Always on</p>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              On
            </Badge>
          </div>
        </div>

        {/* App Info */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300">About</h3>
          <div className="bg-slate-800 rounded-lg p-3 space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>App Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span>2024.05.24</span>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="space-y-2 text-center text-xs">
          <button className="block w-full text-emerald-500 hover:text-emerald-400 py-2">
            Privacy Policy
          </button>
          <button className="block w-full text-emerald-500 hover:text-emerald-400 py-2">
            Terms of Service
          </button>
          <button className="block w-full text-slate-500 hover:text-slate-400 py-2">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
