"use client";
import { useUserStore } from "@/store/userStore";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/auth";
export default function AdminHeader() {
  const user = useUserStore((s) => s.user);
  const [showProfile, setShowProfile] = useState(false);
  const handleLogout = async () => {
    // Thực hiện logout ở đây
    await signOut();
    window.location.href = "/";
  };
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all"
        />
      </div>
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50" />
        </button>
        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">
                {user?.displayName || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">{user?.role || "ADMIN"}</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-secondary border border-white/[0.06] rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2">
              <a
                href="/admin/settings"
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
                Cài đặt
              </a>
              <hr className="border-white/[0.06] my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/5 transition-colors">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
