"use client"

import { useEffect, useState, useRef } from 'react'
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr'
import { getModerationRequests, getModerationRequest, approveModerationRequest, rejectModerationRequest } from '@/lib/adminApi'
import { cn } from '@/lib/cn'
import {
  ShieldCheck, Check, X, Clock, Users, MapPin,
  RefreshCw, MessageSquare, Eye, Store, User
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type ModerationRequest = {
  id: string
  type: string
  targetId: string
  requestedBy: string
  status: string
  reason?: string
  ownerFullName?: string | null
  ownerPhoneNumber?: string | null
  ownerAvatar?: string | null
  ownerBrandName?: string | null
  createdAt?: unknown
  updatedAt?: unknown
}

type ModerationDetailResponse = {
  request: ModerationRequest
  requestedByUser?: {
    id: string
    email?: string
    fullName?: string
    role?: string
    avatar?: string | null
    phoneNumber?: string | null
    brandName?: string | null
  } | null
}

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<ModerationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [detailModal, setDetailModal] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<ModerationDetailResponse | null>(null)

  const connectionRef = useRef<HubConnection | null>(null);

  async function load() {
    setLoading(true)
    const res = await getModerationRequests(statusFilter === 'ALL' ? undefined : statusFilter)
    if (res.success) setRequests(res.data?.items || [])
    setLoading(false)
  }

  useEffect(() => { 
    let cancelled = false

    void (async () => {
      setLoading(true)
      const res = await getModerationRequests(statusFilter === 'ALL' ? undefined : statusFilter)
      if (cancelled) return
      if (res.success) setRequests(res.data?.items || [])
      setLoading(false)
    })()

    // Setup SignalR for real-time requests
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ft_token="))
      ?.split("=")[1];

    const hubUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5190") + "/hubs/location";
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token || "" })
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect()
      .build();

    conn.on("NewModerationRequest", () => {
      // Refresh the list when a new request arrives
      void (async () => {
        const res = await getModerationRequests(statusFilter === 'ALL' ? undefined : statusFilter)
        if (res.success) setRequests(res.data?.items || [])
      })()
    });

    conn.start().then(() => {
      connectionRef.current = conn;
    }).catch(() => {});

    return () => { cancelled = true; conn.stop(); };
  }, [statusFilter])

  async function handleApprove(id: string) {
    setActionLoading(id)
    const res = await approveModerationRequest(id)
    if (res.success) await load()
    setActionLoading(null)
  }

  async function handleReject(id: string) {
    setActionLoading(id)
    const res = await rejectModerationRequest(id, rejectReason)
    if (res.success) {
      setRejectModal(null)
      setRejectReason('')
      await load()
    }
    setActionLoading(null)
  }

  async function handleViewDetail(id: string) {
    setDetailModal(true)
    setDetailLoading(true)
    setSelectedDetail(null)

    const res = await getModerationRequest(id)
    if (res.success) {
      setSelectedDetail(res.data as ModerationDetailResponse)
    }
    setDetailLoading(false)
  }

  const typeConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
    POI_CREATE: { label: 'Tạo địa điểm', icon: MapPin, color: 'text-blue-400 bg-blue-500/10' },
    POI_UPDATE: { label: 'Cập nhật địa điểm', icon: RefreshCw, color: 'text-teal-400 bg-teal-500/10' },
    UPGRADE_OWNER: { label: 'Nâng cấp Owner', icon: Users, color: 'text-purple-400 bg-purple-500/10' },
  }

  const statusColors: Record<string, string> = {
    PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    APPROVED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    REJECTED: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Duyệt nội dung</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingCount > 0 ? `${pendingCount} yêu cầu đang chờ duyệt` : 'Không có yêu cầu nào đang chờ'}
          </p>
        </div>
        <button
          onClick={load}
          className="p-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-medium transition-colors border',
              statusFilter === s
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/[0.02] text-muted-foreground border-white/[0.06] hover:bg-white/[0.04]'
            )}
          >
            {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Chờ duyệt' : s === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
          </button>
        ))}
      </div>

      {/* Request List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ShieldCheck size={48} className="text-emerald-500/20 mb-3" />
          <p className="text-lg font-medium text-foreground">Không có yêu cầu nào</p>
          <p className="text-sm text-muted-foreground mt-1">Tất cả đã được xử lý hoặc chưa có yêu cầu mới</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const type = typeConfig[req.type] || typeConfig.POI_CREATE
            const TypeIcon = type.icon
            const isPending = req.status === 'PENDING'

            return (
              <div
                key={req.id}
                className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-5 hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className={cn('p-3 rounded-xl shrink-0', type.color)}>
                      <TypeIcon size={20} />
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">{type.label}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border',
                          statusColors[req.status] || statusColors.PENDING
                        )}>
                          {req.status}
                        </span>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          Target: <span className="font-mono text-foreground/70">{req.targetId}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Người gửi: <span className="font-mono text-foreground/70">{req.requestedBy}</span>
                        </p>
                      </div>
                      {req.reason && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare size={12} className="shrink-0 mt-0.5" />
                          <span>{req.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleViewDetail(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] text-foreground border border-white/[0.06] text-xs font-medium hover:bg-white/[0.06] transition-colors"
                    >
                      <Eye size={14} />
                      Chi tiết
                    </button>
                    {isPending && (
                      <>
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        <Check size={14} />
                        Duyệt
                      </button>
                      <button
                        onClick={() => setRejectModal(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        <X size={14} />
                        Từ chối
                      </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative w-full max-w-md bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-foreground">Từ chối yêu cầu</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Vui lòng nhập lý do từ chối</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Lý do từ chối..."
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleReject(rejectModal)}
                disabled={actionLoading === rejectModal}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Chi tiết yêu cầu owner</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Xem thông tin người gửi và hồ sơ đã nộp
                </p>
              </div>
              <button
                onClick={() => setDetailModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedDetail ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                        <User size={14} className="text-emerald-400" />
                        Người gửi
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          Tên: <span className="text-foreground">{selectedDetail.requestedByUser?.fullName || selectedDetail.requestedByUser?.email || selectedDetail.request.requestedBy}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Email: <span className="text-foreground">{selectedDetail.requestedByUser?.email || "—"}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Role: <span className="text-foreground">{selectedDetail.requestedByUser?.role || "USER"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                        <Clock size={14} className="text-amber-400" />
                        Trạng thái
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          Status: <span className="text-foreground">{selectedDetail.request.status}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Type: <span className="text-foreground">{selectedDetail.request.type}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Target: <span className="font-mono text-foreground">{selectedDetail.request.targetId}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <Store size={14} className="text-purple-400" />
                      Hồ sơ owner đã gửi
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Họ và tên</p>
                        <p className="text-sm text-foreground">{selectedDetail.request.ownerFullName || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Số điện thoại</p>
                        <p className="text-sm text-foreground">{selectedDetail.request.ownerPhoneNumber || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Brand name</p>
                        <p className="text-sm text-foreground">{selectedDetail.request.ownerBrandName || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Avatar URL</p>
                        <p className="text-sm text-foreground break-all">{selectedDetail.request.ownerAvatar || "—"}</p>
                      </div>
                    </div>

                    {selectedDetail.request.ownerAvatar ? (
                      <div className="mt-4 flex items-center gap-3">
                        <img
                          src={selectedDetail.request.ownerAvatar}
                          alt="Owner avatar"
                          className="h-16 w-16 rounded-2xl object-cover border border-white/[0.08]"
                        />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {selectedDetail.request.ownerBrandName || selectedDetail.request.ownerFullName || "Avatar preview"}
                          </p>
                          <p>Preview ảnh đại diện</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {selectedDetail.request.reason ? (
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                        <MessageSquare size={14} className="text-blue-400" />
                        Ghi chú
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedDetail.request.reason}</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Không tải được chi tiết yêu cầu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
