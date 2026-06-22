"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Utensils,
  BarChart2,
  User,
  Settings,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/owner/pois", label: "My POIs", icon: MapPin },
  { href: "/owner/menu", label: "Menu", icon: Utensils },
  { href: "/owner/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/owner/profile", label: "Profile", icon: User },
  { href: "/owner/settings", label: "Settings", icon: Settings },
];

export default function OwnerSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-colors duration-300">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">
              Street Voice
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Owner Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-3 mb-2">
          Manage
        </p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 ${
                  active
                    ? "text-orange-500"
                    : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                }`}
                size={18}
              />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[10px] text-center text-gray-400 dark:text-gray-600">
          Vinh Khánh Street Voice
        </p>
      </div>
    </aside>
  );
}
