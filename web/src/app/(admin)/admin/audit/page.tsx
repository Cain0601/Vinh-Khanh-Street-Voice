"use client"

import { useEffect, useState, useCallback } from 'react'
import { getAuditLogs } from '@/lib/adminApi'
import { cn } from '@/lib/cn'
import {
  ScrollText, Search, ChevronLeft, ChevronRight,
  UserCog, Shield, Trash2, Plus, Check, X,
  Lock, Unlock, Eye
} from 'lucide-react'

type AuditLog = {
  id: string
  adminId: string
  action: string
  targetId: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  userAgent?: string
  createdAt?: any
}

const actionConfig: Record<string, { label: string; icon: any; color: string }> = {
  CHANGE_ROLE: { label: 'Đổi vai trò', icon: UserCog, color: 'text-purple-400 bg-purple-500/10' },
  LOCK_USER: { label: 'Khóa tài khoản', icon: Lock, color: 'text-amber-400 bg-amber-500/10' },
  UNLOCK_USER: { label: 'Mở khóa tài khoản', icon: Unlock, color: 'text-emerald-400 bg-emerald-500/10' },
  DELETE_USER: { label: 'Xóa người dùng', icon: Trash2, color: 'text-red-400 bg-red-500/10' },
  APPROVE_MODERATION: { label: 'Duyệt yêu cầu', icon: Check, color: 'text-emerald-400 bg-emerald-500/10' },
  REJECT_MODERATION: { label: 'Từ chối yêu cầu', icon: X, color: 'text-red-400 bg-red-500/10' },
  CREATE_CATEGORY: { label: 'Tạo danh mục', icon: Plus, color: 'text-blue-400 bg-blue-500/10' },
  DELETE_CATEGORY: { label: 'Xóa danh mục', icon: Trash2, color: 'text-red-400 bg-red-500/10' },
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const pageSize = 20

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getAuditLogs(page, pageSize)
    if (res.success) {
      const data = res.data
      setLogs(data?.data || [])
      setTotal(data?.total || 0)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / pageSize)

  const filteredLogs = search
    ? logs.filter(l =>
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.targetId?.toLowerCase().includes(search.toLowerCase()) ||
        l.adminId?.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  function parseJson(s?: string) {
    if (!s) return null
    try { return JSON.parse(s) } catch { return s }
  }

  function formatTimestamp(ts: any): string {
    if (!ts) return '—'
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString('vi-VN')
    if (typeof ts === 'string') return new Date(ts).toLocaleString('vi-VN')
    return '—'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nhật ký hoạt động</h1>
        <p className="text-sm text-muted-foreground mt-1">Theo dõi tất cả thao tác quản trị trong hệ thống</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo hành động, target hoặc admin..."
          className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
      </div>

      {/* Timeline */}
      <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ScrollText size={48} className="text-white/10 mb-3" />
            <p className="text-sm text-muted-foreground">Chưa có nhật ký nào</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filteredLogs.map((log) => {
              const cfg = actionConfig[log.action] || { label: log.action, icon: Shield, color: 'text-slate-400 bg-slate-500/10' }
              const ActionIcon = cfg.icon

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  {/* Icon */}
                  <div className={cn('p-2 rounded-xl shrink-0 mt-0.5', cfg.color)}>
                    <ActionIcon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">#{log.id.slice(0, 8)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Target: <span className="font-mono text-foreground/60">{log.targetId.slice(0, 12)}</span></span>
                      <span>·</span>
                      <span>Admin: <span className="font-mono text-foreground/60">{log.adminId.slice(0, 12)}</span></span>
                    </div>
                  </div>

                  {/* Time + Detail */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{formatTimestamp(log.createdAt)}</span>
                    <Eye size={14} className="text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06]">
            <p className="text-xs text-muted-foreground">
              Trang {page}/{totalPages} · {total} mục
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i
                if (p > totalPages || p < 1) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                      p === page ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/[0.06] text-muted-foreground'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-lg bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#131b2e]">
              <h3 className="text-lg font-semibold text-foreground">Chi tiết nhật ký</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Hành động</p>
                  <p className="text-sm font-medium text-foreground">{actionConfig[selectedLog.action]?.label || selectedLog.action}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Thời gian</p>
                  <p className="text-sm text-foreground">{formatTimestamp(selectedLog.createdAt)}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-muted-foreground mb-1">Admin ID</p>
                <p className="text-xs text-foreground font-mono break-all">{selectedLog.adminId}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-muted-foreground mb-1">Target ID</p>
                <p className="text-xs text-foreground font-mono break-all">{selectedLog.targetId}</p>
              </div>

              {selectedLog.oldValue && (
                <div className="p-3 rounded-xl bg-red-500/[0.03] border border-red-500/10">
                  <p className="text-xs text-red-400 mb-1">Giá trị cũ</p>
                  <pre className="text-xs text-foreground/70 font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(parseJson(selectedLog.oldValue), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div className="p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                  <p className="text-xs text-emerald-400 mb-1">Giá trị mới</p>
                  <pre className="text-xs text-foreground/70 font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(parseJson(selectedLog.newValue), null, 2)}
                  </pre>
                </div>
              )}

              {(selectedLog.ipAddress || selectedLog.userAgent) && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Metadata</p>
                  {selectedLog.ipAddress && <p className="text-xs text-foreground/70">IP: {selectedLog.ipAddress}</p>}
                  {selectedLog.userAgent && <p className="text-xs text-foreground/70 mt-0.5 truncate">UA: {selectedLog.userAgent}</p>}
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-muted-foreground mb-1">Log ID</p>
                <p className="text-[10px] text-muted-foreground font-mono break-all">{selectedLog.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
