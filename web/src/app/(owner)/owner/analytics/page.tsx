"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Star,
  QrCode,
  Utensils,
  MapPin,
  Loader,
  RefreshCw,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
} from "recharts";
import { api } from "@/lib/api";
import { analyticsApi } from "@/lib/api/analytics";

type ChartPoint = { name: string; pois: number; menuItems: number };
type DistributionPoint = { name: string; value: number };

type QrStats = {
  totalScans: number;
  bySource: { source: string; count: number }[];
  byPoi: { poiId: string; poiName: string; count: number }[];
};

type AnalyticsResponse = {
  stats: {
    totalPois: number;
    activePois: number;
    totalMenuItems: number;
    avgRating: number;
    activeRate: number;
  };
  chartData: ChartPoint[];
  distribution: DistributionPoint[];
};

const COLORS = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [qrStats, setQrStats] = useState<QrStats | null>(null);
  const [data, setData] = useState<AnalyticsResponse>({
    stats: {
      totalPois: 0,
      activePois: 0,
      totalMenuItems: 0,
      avgRating: 0,
      activeRate: 0,
    },
    chartData: [],
    distribution: [],
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, qrRes] = await Promise.all([
        api.get("/owners/analytics"),
        analyticsApi.getQrStats(),
      ]);
      setData(((analyticsRes as any)?.data as AnalyticsResponse) || data);

      setQrStats(qrRes);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalDistribution = useMemo(
    () => data.distribution.reduce((acc, item) => acc + item.value, 0),
    [data.distribution],
  );

  const statCards = [
    {
      label: "Total QR Scans",
      value: (qrStats?.totalScans || 0).toLocaleString(),
      change: qrStats?.bySource.find((s) => s.source === "app")?.count || 0,
      icon: QrCode,
      color: "green",
      suffix: " in-app",
    },
    {
      label: "Total POIs",
      value: data.stats.totalPois.toLocaleString(),
      change: data.stats.activeRate,
      icon: MapPin,
      color: "blue",
      suffix: "% active",
    },
    {
      label: "Menu Items",
      value: data.stats.totalMenuItems.toLocaleString(),
      change:
        data.stats.totalPois > 0
          ? Number(
              (data.stats.totalMenuItems / data.stats.totalPois).toFixed(1),
            )
          : 0,
      icon: Utensils,
      color: "orange",
      suffix: " avg/POI",
    },
    {
      label: "Avg Rating",
      value: data.stats.avgRating.toFixed(2),
      change: data.stats.avgRating,
      icon: Star,
      color: "yellow",
      suffix: " / 5",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time owner metrics powered by backend data.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Calendar className="w-5 h-5" /> Last 7 Days
          </button>
          <button
            onClick={fetchAnalytics}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}{" "}
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
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
              <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                {Number(stat.change).toFixed(1)}
                {stat.suffix}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              QR Scans by POI
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Scans
                </span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            {qrStats?.byPoi && qrStats.byPoi.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qrStats.byPoi}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="poiName"
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
                  <Bar
                    dataKey="count"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No scan data available yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">
            Scan Source Distribution
          </h2>
          <div className="h-[300px] w-full relative">
            {qrStats?.bySource && qrStats.bySource.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qrStats.bySource.map((s) => ({
                      name: s.source === "app" ? "In-App" : "External",
                      value: s.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {qrStats.bySource.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No source data.
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {qrStats?.totalScans || 0}
              </p>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Total Scans
              </p>
            </div>
          </div>

          <div className="mt-auto pt-8 space-y-4">
            {qrStats?.bySource.map((item, index) => (
              <div
                key={`${item.source}-${index}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                    {item.source === "app"
                      ? "In-App Scanner"
                      : "External Camera"}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
