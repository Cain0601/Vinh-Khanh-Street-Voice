"use client"

import { useEffect, useState } from 'react'
import { getPois, getCategories } from '@/lib/api'
import { cn } from '@/lib/cn'
import {
  MapPin, Search, Eye, CheckCircle, XCircle,
  Clock, Filter, ChevronDown
} from 'lucide-react'

type Poi = {
  id: string
  title?: Record<string, string>
  address?: string
  categoryId?: string
  ownerId?: string
  status?: string
  isActive: boolean
  rating?: number
  reviewCount?: number
  mediaUrls?: string[]
  createdAt?: any
}

export default function AdminPoisPage() {
  const [pois, setPois] = useState<Poi[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [poisRes, catRes] = await Promise.all([
        getPois(),
        getCategories()
      ])
      if (poisRes.success) setPois(Array.isArray(poisRes.data) ? poisRes.data : [])
      if (catRes.success) setCategories(Array.isArray(catRes.data) ? catRes.data : [])
      setLoading(false)
    }
    load()
  }, [])

  const getCategoryName = (catId?: string) => {
    const cat = categories.find((c: any) => c.id === catId)
    return cat?.name?.vi || cat?.slug || '—'
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    approved: { label: 'Đã duyệt', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
    pending: { label: 'Chờ duyệt', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
    rejected: { label: 'Từ chối', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
  }

  const filtered = pois.filter(p => {
    if (statusFilter !== 'all' && p.status?.toLowerCase() !== statusFilter) return false
    if (search) {
      const title = p.title?.vi || p.title?.en || ''
      return title.toLowerCase().includes(search.toLowerCase()) || p.address?.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  const stats = {
    total: pois.length,
    approved: pois.filter(p => p.status?.toLowerCase() === 'approved').length,
    pending: pois.filter(p => p.status?.toLowerCase() === 'pending').length,
    rejected: pois.filter(p => p.status?.toLowerCase() === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý địa điểm</h1>
        <p className="text-sm text-muted-foreground mt-1">Xem và quản lý tất cả POI trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng cộng', value: stats.total, color: 'text-blue-400' },
          { label: 'Đã duyệt', value: stats.approved, color: 'text-emerald-400' },
          { label: 'Chờ duyệt', value: stats.pending, color: 'text-amber-400' },
          { label: 'Từ chối', value: stats.rejected, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-secondary/50 border border-white/[0.06] px-4 py-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-0.5', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc địa chỉ..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium transition-colors border',
                statusFilter === s
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/[0.02] text-muted-foreground border-white/[0.06] hover:bg-white/[0.04]'
              )}
            >
              {s === 'all' ? 'Tất cả' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Địa điểm</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danh mục</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đánh giá</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((poi) => {
                  const st = statusConfig[poi.status?.toLowerCase() || ''] || statusConfig.pending
                  const StIcon = st.icon
                  return (
                    <tr key={poi.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
                            {poi.mediaUrls?.[0] ? (
                              <img src={poi.mediaUrls[0]} alt="" className="w-10 h-10 rounded-xl object-cover" />
                            ) : (
                              <MapPin size={18} className="text-emerald-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{poi.title?.vi || poi.title?.en || `POI ${poi.id.slice(0, 8)}`}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{poi.address || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">{getCategoryName(poi.categoryId)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border', st.color)}>
                          <StIcon size={10} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-xs">★</span>
                          <span className="text-sm text-foreground">{poi.rating?.toFixed(1) || '—'}</span>
                          <span className="text-xs text-muted-foreground">({poi.reviewCount || 0})</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-muted-foreground font-mono">{poi.ownerId?.slice(0, 8) || '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedPoi(poi)}
                          className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      Không tìm thấy địa điểm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POI Detail Modal */}
      {selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPoi(null)} />
          <div className="relative w-full max-w-lg bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#131b2e]">
              <h3 className="text-lg font-semibold text-foreground">Chi tiết địa điểm</h3>
              <button onClick={() => setSelectedPoi(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tên (vi)</p>
                <p className="text-foreground font-medium">{selectedPoi.title?.vi || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tên (en)</p>
                <p className="text-foreground">{selectedPoi.title?.en || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Địa chỉ</p>
                <p className="text-foreground">{selectedPoi.address || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Danh mục</p>
                  <p className="text-sm text-foreground">{getCategoryName(selectedPoi.categoryId)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
                  <p className="text-sm text-foreground capitalize">{selectedPoi.status || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Đánh giá</p>
                  <p className="text-sm text-foreground">★ {selectedPoi.rating?.toFixed(1) || '—'} ({selectedPoi.reviewCount || 0})</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Owner ID</p>
                  <p className="text-xs text-foreground font-mono">{selectedPoi.ownerId || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID</p>
                <p className="text-xs text-muted-foreground font-mono">{selectedPoi.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
