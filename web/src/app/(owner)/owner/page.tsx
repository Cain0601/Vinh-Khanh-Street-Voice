"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  TrendingUp,
  Plus,
  Utensils,
  MapPin,
  Loader,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { api } from "@/lib/api";

type ChartPoint = {
  name: string;
  pois: number;
  menuItems: number;
};

type DashboardData = {
  stats: {
    totalPois: number;
    activePois: number;
    totalMenuItems: number;
    avgRating: number;
    activeRate: number;
  };
  chartData: ChartPoint[];
};

const initialData: DashboardData = {
  stats: {
    totalPois: 0,
    activePois: 0,
    totalMenuItems: 0,
    avgRating: 0,
    activeRate: 0,
  },
  chartData: [],
};

export default function OwnerDashboard() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData>(initialData);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/owners/dashboard");
      setDashboard(((response as any)?.data as DashboardData) || initialData);

    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = useMemo(
    () => [
      {
        label: "Tổng POI",
        value: dashboard.stats.totalPois.toLocaleString(),
        changeText: `${dashboard.stats.activeRate}% đang hoạt động`,
        icon: MapPin,
        color: "blue",
      },
      {
        label: "Món ăn",
        value: dashboard.stats.totalMenuItems.toLocaleString(),
        changeText:
          dashboard.stats.totalPois > 0
            ? `${(dashboard.stats.totalMenuItems / dashboard.stats.totalPois).toFixed(1)} trung bình/POI`
            : "0 trung bình/POI",
        icon: Utensils,
        color: "orange",
      },
      {
        label: "Điểm trung bình",
        value: dashboard.stats.avgRating.toFixed(2),
        changeText: "trên 5.0",
        icon: Star,
        color: "yellow",
      },
      {
        label: "POI đang hoạt động",
        value: dashboard.stats.activePois.toLocaleString(),
        changeText: `${dashboard.stats.activeRate}% tổng số`,
        icon: TrendingUp,
        color: "green",
      },
    ],
    [dashboard],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chào mừng, {user?.fullName?.split(" ")[0] || "Chủ quán"}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Đây là tổng quan hoạt động kinh doanh trực tiếp từ hệ thống.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}{" "}
            Làm mới
          </button>
          <Link
            href="/owner/pois"
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" /> Thêm POI mới
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl transition-colors ${stat.color === "blue" && "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"} ${stat.color === "orange" && "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"} ${stat.color === "yellow" && "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"} ${stat.color === "green" && "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                <Activity className="w-3.5 h-3.5" /> Trực tiếp
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stat.changeText}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            POI và Món ăn (7 ngày)
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                POI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Món ăn
              </span>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboard.chartData}>
              <defs>
                <linearGradient id="dashboardPois" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="dashboardMenuItems"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="pois"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#dashboardPois)"
              />
              <Area
                type="monotone"
                dataKey="menuItems"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#dashboardMenuItems)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
