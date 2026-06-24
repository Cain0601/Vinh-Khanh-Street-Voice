"use client";
import { useEffect, useState, useCallback } from "react";
import { getAdminUsers, changeUserRole, changeUserStatus, deleteUser } from "@/lib/adminApi";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/cn";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Lock,
  Unlock,
  Trash2,
  Eye,
  X,
  Check,
} from "lucide-react";
type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  language: string;
  isActive: boolean;
  isOnboarded: boolean;
  createdAt?: any;
};
export default function AdminUsersPage() {
  const currentUser = useUserStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const pageSize = 15;
  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAdminUsers(page, pageSize);
    if (res.success) {
      const data = res.data;
      setUsers(data?.data || []);
      setTotal(data?.total || 0);
    }
    setLoading(false);
  }, [page]);
  useEffect(() => {
    load();
  }, [load]);
  const totalPages = Math.ceil(total / pageSize);
  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : users;
  async function handleRoleChange(userId: string, newRole: string) {
    if (currentUser?.id === userId && newRole !== "ADMIN") {
      if (!confirm("CẢNH BÁO: Bạn đang tự hạ cấp tài khoản của chính mình. Bạn sẽ bị ĐĂNG XUẤT và mất quyền Admin ngay lập tức. Chắc chắn tiếp tục?")) return;
    } else {
      if (!confirm(`Bạn có chắc chắn muốn đổi vai trò người dùng này thành ${newRole}?`)) return;
    }
    setActionLoading(true);
    const res = await changeUserRole(userId, newRole);
    if (res.success) {
      await load();
      setShowModal(false);
    }
    setActionLoading(false);
  }
  async function handleStatusToggle(userId: string, currentActive: boolean) {
    if (currentUser?.id === userId && currentActive) {
      if (!confirm("CẢNH BÁO: Bạn đang tự khóa tài khoản của chính mình. Bạn sẽ bị ĐĂNG XUẤT ngay lập tức. Chắc chắn tiếp tục?")) return;
    } else {
      if (!confirm(`Bạn có chắc chắn muốn ${currentActive ? 'khóa' : 'mở khóa'} tài khoản người dùng này?`)) return;
    }
    setActionLoading(true);
    const res = await changeUserStatus(userId, !currentActive);
    if (res.success) await load();
    setActionLoading(false);
  }
  async function handleDelete(userId: string) {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    setActionLoading(true);
    const res = await deleteUser(userId);
    if (res.success) {
      await load();
      setShowModal(false);
    }
    setActionLoading(false);
  }
  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
      OWNER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      USER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
    const icons: Record<string, any> = {
      ADMIN: ShieldCheck,
      OWNER: Shield,
      USER: UserIcon,
    };
    const Icon = icons[role] || UserIcon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border",
          styles[role] || styles.USER,
        )}>
        <Icon size={10} />
        {role}
      </span>
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} người dùng trong hệ thống</p>
        </div>
      </div>
      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
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
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ngôn ngữ
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.fullName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {u.fullName || "(chưa đặt tên)"}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{roleBadge(u.role)}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground uppercase">{u.language}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border",
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20",
                        )}>
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            u.isActive ? "bg-emerald-400" : "bg-red-400",
                          )}
                        />
                        {u.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                          title="Xem chi tiết">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(u.id, u.isActive)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            u.isActive
                              ? "hover:bg-amber-500/10 text-muted-foreground hover:text-amber-400"
                              : "hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400",
                          )}
                          title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}>
                          {u.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-muted-foreground">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06]">
            <p className="text-xs text-muted-foreground">
              Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} trong {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                    p === page
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "hover:bg-white/[0.06] text-muted-foreground",
                  )}>
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-foreground">Chi tiết người dùng</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20">
                  {selectedUser.fullName?.[0]?.toUpperCase() ||
                    selectedUser.email?.[0]?.toUpperCase() ||
                    "?"}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedUser.fullName || "(chưa đặt tên)"}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Vai trò</p>
                  <div>{roleBadge(selectedUser.role)}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium",
                      selectedUser.isActive ? "text-emerald-400" : "text-red-400",
                    )}>
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        selectedUser.isActive ? "bg-emerald-400" : "bg-red-400",
                      )}
                    />
                    {selectedUser.isActive ? "Hoạt động" : "Đã khóa"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Ngôn ngữ</p>
                  <p className="text-sm text-foreground uppercase">{selectedUser.language}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Onboarding</p>
                  <p className="text-sm text-foreground">
                    {selectedUser.isOnboarded ? "Đã hoàn thành" : "Chưa"}
                  </p>
                </div>
              </div>
              {/* Role change */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Đổi vai trò</p>
                <div className="flex gap-2">
                  {["USER", "OWNER", "ADMIN"].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(selectedUser.id, role)}
                      disabled={selectedUser.role === role || actionLoading}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-semibold uppercase border transition-all",
                        selectedUser.role === role
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-default"
                          : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50",
                      )}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => handleStatusToggle(selectedUser.id, selectedUser.isActive)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                  selectedUser.isActive
                    ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                    : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10",
                )}>
                {selectedUser.isActive ? "Khóa tài khoản" : "Mở khóa"}
              </button>
              <button
                onClick={() => handleDelete(selectedUser.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
