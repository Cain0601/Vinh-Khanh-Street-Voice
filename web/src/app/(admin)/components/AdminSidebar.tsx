"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  MapPin,
  ShieldCheck,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/pois", label: "Địa điểm", icon: MapPin },
  { href: "/admin/approvals", label: "Duyệt nội dung", icon: ShieldCheck },
  { href: "/admin/audit", label: "Nhật ký", icon: ScrollText },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];
export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const logout = useUserStore((s) => s.logout);
  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-secondary/80 backdrop-blur-sm border border-white/5 text-muted-foreground hover:text-foreground transition-colors">
        <Menu size={20} />
      </button>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full flex flex-col transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-[#0c1222] to-[#0f172a] border-r border-white/[0.06]",
          collapsed ? "w-[72px]" : "w-64",
          // Mobile: overlay
          "lg:relative",
          collapsed ? "max-lg:-translate-x-full" : "max-lg:translate-x-0 max-lg:shadow-2xl",
        )}>
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06]">
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                VK
              </div>
              <span className="font-semibold text-foreground tracking-tight">Admin Portal</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft
              size={18}
              className={cn("transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                )}>
                <item.icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-colors",
                    active
                      ? "text-emerald-400"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                )}
              </Link>
            );
          })}
        </nav>
        {/* Bottom section */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium",
              "text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all duration-200",
            )}>
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>
      {/* Mobile backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
