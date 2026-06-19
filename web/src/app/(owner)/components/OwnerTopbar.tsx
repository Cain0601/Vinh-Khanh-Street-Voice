"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Mail,
  Shield,
  X,
  LogOut,
  CheckCircle2,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    icon: Star,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-50 dark:bg-yellow-500/10",
    title: "New 5-star review!",
    desc: "A customer just rated \"Bánh mì Hội An\" 5 stars.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: CheckCircle2,
    iconColor: "text-green-500",
    iconBg: "bg-green-50 dark:bg-green-500/10",
    title: "POI approved",
    desc: "Your new location \"Cơm Gà Tam Kỳ\" has been approved.",
    time: "15 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: AlertCircle,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    title: "Menu item sold out",
    desc: "\"Mì Quảng đặc biệt\" has been marked as unavailable.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 4,
    icon: Clock,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    title: "Profile update reminder",
    desc: "Complete your restaurant profile to attract more visitors.",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: 5,
    icon: Star,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-50 dark:bg-yellow-500/10",
    title: "Weekly summary ready",
    desc: "You got 24 new reviews this week — up 18% from last week.",
    time: "Yesterday",
    unread: false,
  },
];

export default function OwnerTopbar() {
  const { user, logout } = useUserStore();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <>
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for POI, menu item..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none text-gray-600 dark:text-gray-200 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* RoleSwitcher omitted in this project - placeholder */}

          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-2"></div>

          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 p-1.5 pl-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all group relative"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Restaurant Owner
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-500 font-bold border-2 border-white dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all">
              {initials}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-all ${isProfileOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </header>

      {isNotifOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotifOpen(false)}
        >
          <div
            className="absolute right-8 top-24 w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* List */}
            <ul className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[420px] overflow-y-auto">
              {notifications.map(({ id, icon: Icon, iconColor, iconBg, title, desc, time, unread }) => (
                <li
                  key={id}
                  onClick={() => markRead(id)}
                  className={`flex gap-4 px-5 py-4 cursor-pointer transition-colors ${
                    unread
                      ? "bg-orange-50/60 dark:bg-orange-500/5 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-snug ${
                        unread ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                      }`}>
                        {title}
                      </p>
                      {unread && (
                        <span className="shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{desc}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1 font-medium">{time}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
              <button className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="absolute right-8 top-24 w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                User Profile
              </h3>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-500/20 rounded-3xl flex items-center justify-center text-orange-600 dark:text-orange-500 text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-xl mb-4">
                {initials}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.fullName}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Restaurant Owner & Food Enthusiast
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Account Role
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Verified Owner
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
