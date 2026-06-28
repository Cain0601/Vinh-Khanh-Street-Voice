"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";
import { getHeatmapData } from "@/lib/adminApi";
import { getAuthToken, getHubUrl } from "@/lib/signalr";
import { Flame, MapPin, Users } from "lucide-react";

const HeatmapMap = dynamic(() => import("./HeatmapMap"), {
  ssr: false,
  loading: () => <div className="h-[60vh] rounded-2xl bg-secondary/50 animate-pulse" />,
});

export type HeatPoint = {
  poiId: string;
  title?: string;
  address?: string;
  lat: number;
  lng: number;
  listens: number;
  scans: number;
  views: number;
  intensity: number;
};

export type LiveUser = {
  userId: string;
  fullName: string;
  lat: number;
  lng: number;
  timestamp: string;
};

export default function AdminHeatmapPage() {
  const [points, setPoints] = useState<HeatPoint[]>([]);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getHeatmapData();
      if (res.success) setPoints(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    })();

    // SignalR Setup
    const hubUrl = getHubUrl("/hubs/location");
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: getAuthToken })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    conn.on("UserLocationUpdated", (data: LiveUser) => {
      setLiveUsers((prev) => {
        const idx = prev.findIndex(u => u.userId === data.userId);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = data;
          return newArr;
        }
        return [...prev, data];
      });
    });

    conn.on("UserDisconnected", (userId: string) => {
      setLiveUsers((prev) => prev.filter(u => u.userId !== userId));
    });

    conn.on("OnlineCountUpdated", (count: number) => {
      setOnlineCount(count);
    });

    conn.on("PoiStatsUpdated", (poiId: string, eventType: string) => {
      setPoints((prev) => {
        return prev.map(p => {
          if (p.poiId === poiId) {
            return {
              ...p,
              intensity: p.intensity + 1,
              views: eventType === 'VIEW' ? p.views + 1 : p.views,
              listens: eventType === 'LISTEN' ? p.listens + 1 : p.listens,
              scans: eventType === 'QR_SCAN' ? p.scans + 1 : p.scans,
            };
          }
          return p;
        });
      });
    });

    conn.start().then(() => {
      console.log("Connected to LocationHub as Admin");
      connectionRef.current = conn;
      conn.invoke("GetOnlineCount").then(count => setOnlineCount(count)).catch(() => {});
    }).catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      conn.stop();
    };
  }, []);

  const maxIntensity = Math.max(1, ...points.map((p) => p.intensity));
  const topAreas = [...points].sort((a, b) => b.intensity - a.intensity).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flame size={22} className="text-orange-400" />
            Heatmap khu vực
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mức độ tương tác (lượt xem + nghe + quét QR) theo từng địa điểm
          </p>
        </div>
        {onlineCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {onlineCount} đang trực tuyến
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-[60vh] rounded-2xl bg-secondary/50 animate-pulse" />
      ) : points.length === 0 && liveUsers.length === 0 ? (
        <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-10 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu tương tác để hiển thị heatmap
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/[0.06]">
            <HeatmapMap points={points} maxIntensity={maxIntensity} liveUsers={liveUsers} />
          </div>

          <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-400" />
              Top khu vực nhiều người đến nhất
            </h2>
            <div className="space-y-3">
              {topAreas.map((p, i) => (
                <div key={p.poiId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white/5 text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.title || p.poiId}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.address || "—"}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-400 shrink-0">
                    {p.intensity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
