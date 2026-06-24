"use client";
import { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";
import {
  getAnalyticsSummary,
  getTopPois,
  getAdminUsers,
  getModerationRequests,
} from "@/lib/adminApi";
import { getCategories } from "@/lib/api";
import {
  Users,
  MapPin,
  Headphones,
  QrCode,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  FolderTree,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/cn";
type KpiCard = {
  label: string;
  value: string | number;
  icon: any;
  gradient: string;
  shadowColor: string;
};
export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [topPois, setTopPois] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({ listens: 0, scans: 0, views: 0 });
  const [onlineCount, setOnlineCount] = useState(0);
  const connectionRef = useRef<HubConnection | null>(null);

  async function load() {
    setLoading(true);
    const [sumRes, topRes, usersRes, modRes, catRes] = await Promise.all([
      getAnalyticsSummary(),
      getTopPois(),
      getAdminUsers(1, 5),
      getModerationRequests("PENDING"),
      getCategories(),
    ]);
    if (sumRes.success) setSummary(sumRes.data);
    if (topRes.success) setTopPois(Array.isArray(topRes.data) ? topRes.data : []);
    if (usersRes.success) setRecentUsers(usersRes.data?.data || usersRes.data || []);
    if (modRes.success) setPendingRequests(modRes.data?.items || []);
    if (catRes.success) setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    setLoading(false);
    // Reset live increments on full refresh
    setLiveStats({ listens: 0, scans: 0, views: 0 });
  }

  useEffect(() => {
    load();

    // SignalR real-time updates
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

    conn.on("PoiStatsUpdated", (_poiId: string, eventType: string) => {
      setLiveStats((prev) => ({
        listens: eventType === "LISTEN" ? prev.listens + 1 : prev.listens,
        scans: eventType === "QR_SCAN" ? prev.scans + 1 : prev.scans,
        views: eventType === "VIEW" ? prev.views + 1 : prev.views,
      }));
    });

    conn.on("UserLocationUpdated", () => {
      setOnlineCount((prev) => prev + 1);
    });

    conn.on("UserDisconnected", () => {
      setOnlineCount((prev) => Math.max(0, prev - 1));
    });

    conn.start().then(() => {
      connectionRef.current = conn;
    }).catch(() => {});

    return () => { conn.stop(); };
  }, []);
  const kpiCards = [
    {
      label: "Tổng người dùng",
      value: summary?.totalUsers ?? "—",
      live: null,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/20",
    },
    {
      label: "Lượt nghe",
      value: summary?.totalListens ?? "—",
      live: liveStats.listens,
      icon: Headphones,
      gradient: "from-emerald-400 to-emerald-600",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      label: "Lượt quét QR",
      value: summary?.totalScans ?? "—",
      live: liveStats.scans,
      icon: QrCode,
      gradient: "from-amber-400 to-orange-500",
      shadowColor: "shadow-amber-500/20",
    },
    {
      label: "Lượt xem",
      value: summary?.totalViews ?? "—",
      live: liveStats.views,
      icon: TrendingUp,
      gradient: "from-purple-400 to-purple-600",
      shadowColor: "shadow-purple-500/20",
    },
  ];
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Tổng quan hệ thống VinhKhanh Food Tour</p>
        </div>
        <div className="flex items-center gap-3">
          {onlineCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {onlineCount} đang trực tuyến
            </div>
          )}
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground border border-white/[0.06] hover:bg-white/[0.04] hover:text-foreground transition-colors"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-secondary/50 border border-white/[0.06] p-5 group hover:border-white/[0.1] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1 tracking-tight">
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </p>
                {card.live !== null && card.live > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-400">
                    <ArrowUpRight size={14} />
                    +{card.live} phiên này
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                  card.gradient,
                  card.shadowColor,
                )}>
                <card.icon size={22} className="text-white" />
              </div>
            </div>
            {/* Decorative gradient */}
            <div
              className={cn(
                "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] bg-gradient-to-br",
                card.gradient,
              )}
            />
          </div>
        ))}
      </div>
      {/* Two-column: Top POIs + Pending Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top POIs */}
        <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin size={18} className="text-emerald-400" />
              Top Địa điểm
            </h2>
            <a
              href="/admin/pois"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Xem tất cả →
            </a>
          </div>
          <div className="space-y-3">
            {topPois.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Chưa có dữ liệu</p>
            ) : (
              topPois.slice(0, 5).map((poi: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                      i === 0
                        ? "bg-amber-500/20 text-amber-400"
                        : i === 1
                          ? "bg-slate-400/20 text-slate-300"
                          : i === 2
                            ? "bg-orange-600/20 text-orange-400"
                            : "bg-white/5 text-muted-foreground",
                    )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{poi.title || poi.poiId}</p>
                    <p className="text-xs text-muted-foreground">
                      {poi.listens} nghe · {poi.scans} quét · {poi.views || 0} xem
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{poi.total}</span>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Pending Moderation */}
        <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-400" />
              Chờ duyệt
            </h2>
            <a
              href="/admin/approvals"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Xem tất cả →
            </a>
          </div>
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <ShieldCheck size={32} className="text-emerald-500/30 mb-2" />
                <p className="text-sm text-muted-foreground">Không có yêu cầu nào đang chờ</p>
              </div>
            ) : (
              pendingRequests.slice(0, 5).map((req: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      req.type === "UPGRADE_OWNER"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-blue-500/10 text-blue-400",
                    )}>
                    {req.type === "UPGRADE_OWNER" ? <Users size={16} /> : <MapPin size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {req.type === "UPGRADE_OWNER"
                        ? "Nâng cấp Owner"
                        : req.type === "POI_CREATE"
                          ? "Tạo địa điểm mới"
                          : "Cập nhật địa điểm"}
                    </p>
                    <p className="text-xs text-muted-foreground">ID: {req.targetId}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Pending
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Recent Users + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Người dùng gần đây
            </h2>
            <a
              href="/admin/users"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Xem tất cả →
            </a>
          </div>
          <div className="space-y-2">
            {(Array.isArray(recentUsers) ? recentUsers : [])
              .slice(0, 5)
              .map((u: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.fullName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.fullName || u.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border",
                      u.role === "ADMIN"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : u.role === "OWNER"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    )}>
                    {u.role}
                  </span>
                </div>
              ))}
          </div>
        </div>
        {/* Categories */}
        <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FolderTree size={18} className="text-teal-400" />
              Danh mục
            </h2>
            <a
              href="/admin/categories"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Quản lý →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Array.isArray(categories) ? categories : [])
              .slice(0, 6)
              .map((cat: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                  <span className="text-lg">{cat.icon || "📍"}</span>
                  <span className="text-sm text-foreground truncate">
                    {cat.name?.vi || cat.name?.en || cat.slug}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
