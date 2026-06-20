"use client";
import { useEffect, useState, use } from "react";
import { getAdminUser, changeUserRole, changeUserStatus, deleteUser } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Globe,
  Calendar,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";
export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  async function loadUser() {
    setLoading(true);
    const res = await getAdminUser(id);
    if (res.success) setUser(res.data);
    setLoading(false);
  }
  useEffect(() => {
    loadUser();
  }, [id]);
  async function handleRoleChange(role: string) {
    setActionLoading(true);
    await changeUserRole(id, role);
    await loadUser();
    setActionLoading(false);
  }
  async function handleToggleStatus() {
    if (!user) return;
    setActionLoading(true);
    await changeUserStatus(id, !user.isActive);
    await loadUser();
    setActionLoading(false);
  }
  async function handleDelete() {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    setActionLoading(true);
    await deleteUser(id);
    router.push("/admin/users");
  }
  function formatTimestamp(ts: any): string {
    if (!ts) return "—";
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString("vi-VN");
    if (typeof ts === "string") return new Date(ts).toLocaleString("vi-VN");
    return "—";
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Không tìm thấy người dùng</p>
        <button
          onClick={() => router.push("/admin/users")}
          className="mt-4 text-sm text-emerald-400 hover:underline">
          ← Quay lại
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.push("/admin/users")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>
      {/* Profile */}
      <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-emerald-500/20 shrink-0">
            {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">
              {user.fullName || "(chưa đặt tên)"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Mail size={14} /> {user.email}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase border",
                  user.role === "ADMIN"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : user.role === "OWNER"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20",
                )}>
                {user.role === "ADMIN" ? (
                  <ShieldCheck size={12} />
                ) : user.role === "OWNER" ? (
                  <Shield size={12} />
                ) : (
                  <User size={12} />
                )}
                {user.role}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                  user.isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20",
                )}>
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    user.isActive ? "bg-emerald-400" : "bg-red-400",
                  )}
                />
                {user.isActive ? "Hoạt động" : "Đã khóa"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Ngôn ngữ", value: user.language?.toUpperCase() || "VI", icon: Globe },
          {
            label: "Onboarding",
            value: user.isOnboarded ? "Hoàn thành" : "Chưa",
            icon: ShieldCheck,
          },
          { label: "Ngày tạo", value: formatTimestamp(user.createdAt), icon: Calendar },
          { label: "Cập nhật cuối", value: formatTimestamp(user.updatedAt), icon: Calendar },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl bg-secondary/50 border border-white/[0.06] p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.04]">
              <item.icon size={16} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Role change */}
      <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Đổi vai trò</h3>
        <div className="flex gap-3">
          {["USER", "OWNER", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              disabled={user.role === role || actionLoading}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-semibold uppercase border transition-all",
                user.role === role
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-default"
                  : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50",
              )}>
              {role}
            </button>
          ))}
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleStatus}
          disabled={actionLoading}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50",
            user.isActive
              ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
              : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10",
          )}>
          {user.isActive ? (
            <>
              <Lock size={16} /> Khóa
            </>
          ) : (
            <>
              <Unlock size={16} /> Mở khóa
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
          <Trash2 size={16} /> Xóa
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground font-mono">ID: {id}</p>
    </div>
  );
}
