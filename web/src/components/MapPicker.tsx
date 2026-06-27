"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
type LatLng = { lat: number; lng: number };
type Props = {
  value?: LatLng;
  onChange: (pos: LatLng) => void;
};
// Default center: Vĩnh Khánh street, Quận 4, TP.HCM
const DEFAULT_CENTER: LatLng = { lat: 10.7525, lng: 106.7002 };
export default function MapPicker({ value, onChange }: Props) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [pos, setPos] = useState<LatLng>(value || DEFAULT_CENTER);
  const [mapReady, setMapReady] = useState(false);
  // Dynamically import Leaflet (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;
      const container = containerRef.current;
      if (!container) return;

      // Clean up existing leaflet instance if strict mode caused double initialization
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
        container.innerHTML = "";
      }

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const center = value || DEFAULT_CENTER;
      const map = L.map(container, {
        center: [center.lat, center.lng],
        zoom: 16,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      // Custom emerald marker icon
      const icon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#10b981,#059669);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(16,185,129,0.4)"></div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      const marker = L.marker([center.lat, center.lng], { icon, draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const latlng = marker.getLatLng();
        const newPos = { lat: latlng.lat, lng: latlng.lng };
        setPos(newPos);
        onChange(newPos);
      });
      map.on("click", (e: any) => {
        const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
        marker.setLatLng([newPos.lat, newPos.lng]);
        setPos(newPos);
        onChange(newPos);
      });
      mapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);
  // Sync external value changes
  useEffect(() => {
    if (!value || !markerRef.current || !mapRef.current) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapRef.current.setView([value.lat, value.lng], mapRef.current.getZoom());
    setPos(value);
  }, [value?.lat, value?.lng]);
  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1&countrycodes=vn`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newPos.lat, newPos.lng], 17);
          markerRef.current.setLatLng([newPos.lat, newPos.lng]);
        }
        setPos(newPos);
        onChange(newPos);
      }
    } catch (e) {
      console.error("Geocode error", e);
    }
    setSearching(false);
  }
  function handleUserLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([newPos.lat, newPos.lng], 17);
        markerRef.current.setLatLng([newPos.lat, newPos.lng]);
      }
      setPos(newPos);
      onChange(newPos);
    });
  }
  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Tìm địa chỉ... (Enter để tìm)"
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
            style={{ pointerEvents: "auto" }}
          />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleSearch(); }}
          disabled={searching}
          className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
          {searching ? "..." : "Tìm"}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleUserLocation(); }}
          title="Dùng vị trí của tôi"
          className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors">
          <MapPin size={14} />
        </button>
      </div>
      {/* Map */}
      <div
        className="relative rounded-xl overflow-hidden border border-white/[0.06]"
        style={{ height: 280 }}>
        {/* Inject Leaflet CSS */}
        <style>{`
          @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
          .leaflet-container { background: #1e293b; }
          .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.08) !important; }
          .leaflet-control-zoom a { background: #1e293b !important; color: #94a3b8 !important; border-color: rgba(255,255,255,0.06) !important; }
          .leaflet-control-zoom a:hover { background: #0f172a !important; color: #f8fafc !important; }
        `}</style>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Đang tải bản đồ...
            </div>
          </div>
        )}
        {/* Hint overlay */}
        {mapReady && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 text-[10px] text-white/70 backdrop-blur-sm pointer-events-none">
            Nhấn vào bản đồ hoặc kéo ghim để chọn vị trí
          </div>
        )}
      </div>
      {/* Coordinates display */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <MapPin size={14} className="text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Tọa độ đã chọn</p>
          <p className="text-xs text-foreground font-mono mt-0.5">
            {pos.lat !== DEFAULT_CENTER.lat || pos.lng !== DEFAULT_CENTER.lng ? (
              `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
            ) : (
              <span className="text-muted-foreground italic">
                Chưa chọn (đang dùng vị trí mặc định)
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
