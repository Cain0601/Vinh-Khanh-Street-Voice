"use client"

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { getSystemSettings, updateSystemSettings } from '@/lib/adminApi'
import { cn } from '@/lib/cn'
import {
  Settings, Globe, Bell, Shield, Database,
  Moon, Sun, Save, RotateCcw, ExternalLink
} from 'lucide-react'

export default function AdminSettingsPage() {
  const user = useUserStore(s => s.user)

  const defaultSettings = {
    siteName: 'VinhKhanh Food Tour',
    defaultLanguage: 'vi',
    autoApproval: false,
    requireOnboarding: true,
    maxUploadSize: 10,
    enableAnalytics: true,
    enableNotifications: true,
    maintenanceMode: false,
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await getSystemSettings()
      if (res.success && res.data) {
        setSettings({ ...defaultSettings, ...res.data })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    const res = await updateSystemSettings(settings)
    if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  function handleReset() {
    setSettings(defaultSettings)
  }

  function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-emerald-500' : 'bg-white/10'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
          checked && 'translate-x-5'
        )} />
      </button>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cài đặt hệ thống</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý cấu hình chung cho toàn bộ ứng dụng</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
          >
            <RotateCcw size={14} />
            Đặt lại
          </button>
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-lg',
              saved ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            )}
          >
            {saved ? <><Save size={14} /> Đã lưu!</> : <><Save size={14} /> Lưu thay đổi</>}
          </button>
        </div>
      </div>

      {/* General */}
      <section className="rounded-2xl bg-secondary/50 border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings size={16} className="text-emerald-400" />
            Cài đặt chung
          </h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Tên ứng dụng</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hiển thị trên header và metadata</p>
            </div>
            <input
              value={settings.siteName}
              onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))}
              className="w-64 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground text-right focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Ngôn ngữ mặc định</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ngôn ngữ mặc định cho người dùng mới</p>
            </div>
            <select
              value={settings.defaultLanguage}
              onChange={e => setSettings(s => ({ ...s, defaultLanguage: e.target.value }))}
              className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
            >
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="zh">🇨🇳 中文</option>
            </select>
          </div>
        </div>
      </section>

      {/* Content & Moderation */}
      <section className="rounded-2xl bg-secondary/50 border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield size={16} className="text-amber-400" />
            Nội dung & Kiểm duyệt
          </h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Tự động duyệt POI</p>
              <p className="text-xs text-muted-foreground mt-0.5">POI mới sẽ tự động được duyệt mà không cần admin xác nhận</p>
            </div>
            <ToggleSwitch checked={settings.autoApproval} onChange={v => setSettings(s => ({ ...s, autoApproval: v }))} />
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Yêu cầu Onboarding</p>
              <p className="text-xs text-muted-foreground mt-0.5">Người dùng mới phải hoàn thành onboarding trước khi sử dụng</p>
            </div>
            <ToggleSwitch checked={settings.requireOnboarding} onChange={v => setSettings(s => ({ ...s, requireOnboarding: v }))} />
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Kích thước upload tối đa</p>
              <p className="text-xs text-muted-foreground mt-0.5">Giới hạn kích thước file upload (MB)</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={e => setSettings(s => ({ ...s, maxUploadSize: parseInt(e.target.value) || 0 }))}
                className="w-20 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground text-right focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              <span className="text-xs text-muted-foreground">MB</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications & Analytics */}
      <section className="rounded-2xl bg-secondary/50 border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell size={16} className="text-blue-400" />
            Thông báo & Phân tích
          </h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Thông báo hệ thống</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gửi thông báo cho admin khi có yêu cầu mới</p>
            </div>
            <ToggleSwitch checked={settings.enableNotifications} onChange={v => setSettings(s => ({ ...s, enableNotifications: v }))} />
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Thu thập Analytics</p>
              <p className="text-xs text-muted-foreground mt-0.5">Theo dõi lượt nghe, quét QR và xem trang</p>
            </div>
            <ToggleSwitch checked={settings.enableAnalytics} onChange={v => setSettings(s => ({ ...s, enableAnalytics: v }))} />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl bg-red-500/[0.03] border border-red-500/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/10">
          <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <Database size={16} />
            Vùng nguy hiểm
          </h2>
        </div>
        <div className="divide-y divide-red-500/[0.06]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Chế độ bảo trì</p>
              <p className="text-xs text-muted-foreground mt-0.5">Chặn truy cập từ người dùng. Chỉ admin mới vào được.</p>
            </div>
            <ToggleSwitch checked={settings.maintenanceMode} onChange={v => setSettings(s => ({ ...s, maintenanceMode: v }))} />
          </div>
        </div>
      </section>

      {/* Admin Info */}
      <section className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-6">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Thông tin phiên đăng nhập</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Tên</p>
            <p className="text-foreground">{user?.displayName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-foreground">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vai trò</p>
            <p className="text-foreground">{user?.role || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phiên bản</p>
            <p className="text-foreground">v0.1.0</p>
          </div>
        </div>
      </section>
    </div>
  )
}
