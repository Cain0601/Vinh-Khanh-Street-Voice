'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, LocateFixed, MapPin, MousePointer2, Navigation, Play, Route, X } from 'lucide-react';
import { getPoi, getPois } from '@/lib/api';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import MapFilters from './MapFilters';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/i18n';
import analyticsApi from '@/lib/api/analytics';

// Haversine formula to calculate distance between two lat/lng points in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(meters?: number | null) {
  if (meters == null || Number.isNaN(meters)) return '-';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatDuration(seconds?: number | null) {
  if (seconds == null || Number.isNaN(seconds)) return '-';
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  if (totalMinutes < 60) return `${totalMinutes} phút`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
}

function getString(value: unknown, lang: 'vi' | 'en' = 'vi'): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate = record[lang] ?? record['en'] ?? Object.values(record)[0];
    return typeof candidate === 'string' ? candidate : '';
  }
  return String(value);
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = L.divIcon({
  html: `<div class="bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
  className: 'custom-user-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const PoiIcon = L.divIcon({
  html: `<div class="bg-orange-500 p-1.5 rounded-full border-2 border-white shadow-md text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-3.1-3.5-6.5-6.5-6.5-9.5A6.5 6.5 0 1 1 18.5 11.5c0 3-3.4 6-6.5 9.5z"/><circle cx="12" cy="11" r="3"/></svg></div>`,
  className: 'custom-poi-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const SelectedPoiIcon = L.divIcon({
  html: `<div class="bg-emerald-500 p-1.5 rounded-full border-2 border-white shadow-lg text-white ring-4 ring-emerald-300/50"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-3.1-3.5-6.5-6.5-6.5-9.5A6.5 6.5 0 1 1 18.5 11.5c0 3-3.4 6-6.5 9.5z"/><circle cx="12" cy="11" r="3"/></svg></div>`,
  className: 'custom-poi-icon-selected',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

type PoiApi = {
  id?: string;
  poiId?: string;
  _id?: string;
  title?: unknown;
  name?: unknown;
  summary?: unknown;
  description?: unknown;
  audioUrl?: unknown;
  audioUrls?: unknown;
  mediaUrl?: string;
  categoryId?: string;
  lat?: number;
  lng?: number;
  distance?: number;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  address?: unknown;
  contact?: {
    phoneNumber?: string;
    [key: string]: unknown;
  };
  status?: string;
  visibility?: string;
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
  stats?: {
    qrScans?: number;
    favoriteCount?: number;
    viewCount?: number;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
};

type OsrmRouteResponse = {
  routes?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
    distance?: number;
    duration?: number;
  }>;
};

function MapClickHandler({
  onMapClick,
  trackingMode,
  setInternalUserPos,
}: {
  onMapClick?: (lat: number, lng: number) => void;
  trackingMode: 'auto' | 'manual';
  setInternalUserPos?: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (trackingMode === 'manual') {
        setInternalUserPos?.([lat, lng]);
      }
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    },
  });
  return null;
}

function MapTracker({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyTo(pos, 17, { animate: true });
    }
  }, [pos, map]);
  return null;
}

function RouteLine({ route }: { route: Array<[number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (route.length >= 2) {
      const bounds = L.latLngBounds(route.map((pos) => L.latLng(pos[0], pos[1])));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, route]);

  if (route.length < 2) return null;

  return (
    <Polyline
      positions={route}
      pathOptions={{
        color: '#2563eb',
        weight: 5,
        opacity: 0.9,
      }}
    />
  );
}

export interface POI {
  id: string;
  ownerId?: string;
  title: string;
  summary: string;
  audioUrl?: string;
  mediaUrl?: string;
  categoryId?: string;
  lat?: number;
  lng?: number;
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  contact?: {
    phoneNumber?: string;
    [key: string]: unknown;
  };
  status?: string;
  visibility?: string;
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
  stats?: {
    qrScans?: number;
    favoriteCount?: number;
    viewCount?: number;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
  distance?: number;
}

interface TourMapProps {
  userPos: [number, number] | null;
  pois: POI[];
  onTriggerAudio: (poi: POI) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Helper: fetch detail POI and map to POI type
async function fetchDetailedPoi(basePoi: POI, language: string): Promise<POI> {
  const res = await getPoi(basePoi.id, language);
  if (res.success && res.data) {
    const p = res.data as PoiApi;
    const lang = language === 'en' ? 'en' : 'vi';
    return {
      id: p.id ?? p.poiId ?? p._id ?? basePoi.id,
      lat: p.location?.latitude ?? p.lat ?? basePoi.lat,
      lng: p.location?.longitude ?? p.lng ?? basePoi.lng,
      rating: p.rating ?? basePoi.rating,
      distance: basePoi.distance,
      title: getString(p.title ?? p.name, lang),
      summary: getString(p.summary ?? p.description, lang),
      audioUrl:
        getString(p.audioUrl ?? p.audioUrls, lang) || getString(p.audioUrl, 'vi'),
      mediaUrl: p.mediaUrl ?? basePoi.mediaUrl,
      location: {
        latitude: p.location?.latitude ?? basePoi.location?.latitude,
        longitude: p.location?.longitude ?? basePoi.location?.longitude,
      },
      address: getString(p.address, lang),
      contact: p.contact || basePoi.contact || undefined,
      categoryId: p.categoryId,
      status: p.status,
      visibility: p.visibility,
      isActive: p.isActive,
      reviewCount: p.reviewCount,
      stats: p.stats,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  // fallback to base poi if detail fetch fails
  return basePoi;
}

// Sub-component: Popup content with its own loading state for the "Nghe" button
function PoiPopupContent({
  poi,
  onTriggerAudio,
  onSelectRoute,
}: {
  poi: POI;
  onTriggerAudio: (poi: POI) => void;
  onSelectRoute: (poi: POI) => void;
}) {
  const [loading, setLoading] = useState(false);
  const t = useTranslation();

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const language = useUserStore.getState().language || 'vi';
      const detailedPoi = await fetchDetailedPoi(poi, language);
      onTriggerAudio(detailedPoi);
      analyticsApi.trackListen(poi.id).catch(() => {});
    } catch {
      onTriggerAudio(poi);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-44 p-1">
      <h3 className="text-sm font-bold text-orange-600">{poi.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{poi.summary}</p>
      {poi.distance !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
          <MapPin size={10} />
          <span>{t.map.distancePrefix} {Math.round(poi.distance)}m</span>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelectRoute(poi);
        }}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-700 active:scale-95"
      >
        <Route size={12} />
        Chỉ đường
      </button>
      <button
        onClick={handlePlay}
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            {t.map.loading}
          </>
        ) : (
          <>
            <Play size={12} fill="currentColor" />
            {t.map.playAudio}
          </>
        )}
      </button>
    </div>
  );
}

export default function TourMap({ userPos, pois: initialPois, onTriggerAudio, onMapClick }: TourMapProps) {
  const t = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const currentNearbyIdsRef = useRef<Set<string>>(new Set());
  const watchIdRef = useRef<number | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const activeFilter = searchParams.get('categoryId') || 'all';
  const selectedPoiId = searchParams.get('poiId') || '';
  const [trackingMode, setTrackingMode] = useState<'auto' | 'manual'>(() =>
    typeof navigator !== 'undefined' && navigator.geolocation ? 'auto' : 'manual',
  );
  const [internalUserPos, setInternalUserPos] = useState<[number, number] | null>(userPos ?? null);
  const [fetchedPois, setFetchedPois] = useState<POI[]>([]);
  const [routePoints, setRoutePoints] = useState<Array<[number, number]>>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const activeUserPos = userPos ?? internalUserPos;
  const pois = initialPois && initialPois.length > 0 ? initialPois : fetchedPois;

  const selectedPoiFromList = useMemo(() => {
    if (!selectedPoiId) return null;
    return pois.find((poi) => poi.id === selectedPoiId) ?? null;
  }, [pois, selectedPoiId]);
  const selectedPoi = selectedPoiFromList;

  const filteredPois = useMemo(() => {
    const searchTerm = normalizeSearchValue(searchQuery);

    return pois.filter((poi) => {
      const matchesSearch =
        searchTerm === '' ||
        [poi.title, poi.summary, poi.address]
          .filter((value): value is string => typeof value === 'string')
          .some((value) => value.toLowerCase().includes(searchTerm));

      const matchesCategory = activeFilter === 'all' || poi.categoryId === activeFilter;

      return matchesSearch && matchesCategory;
    });
  }, [pois, searchQuery, activeFilter]);

  const updateMapQuery = (updates: {
    search?: string | null;
    categoryId?: string | null;
    poiId?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.search !== undefined) {
      const nextSearch = normalizeSearchValue(updates.search ?? '');
      if (nextSearch) {
        params.set('search', updates.search ?? '');
      } else {
        params.delete('search');
      }
    }

    if (updates.categoryId !== undefined) {
      if (updates.categoryId && updates.categoryId !== 'all') {
        params.set('categoryId', updates.categoryId);
      } else {
        params.delete('categoryId');
      }
    }

    if (updates.poiId !== undefined) {
      if (updates.poiId) {
        params.set('poiId', updates.poiId);
      } else {
        params.delete('poiId');
      }
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  useEffect(() => {
    let mounted = true;
    getPois()
      .then((res) => {
        if (!mounted) return;
        if (res.success && Array.isArray(res.data)) {
          const transformed = (res.data as PoiApi[]).map((p) => ({
            id: p.id ?? p.poiId ?? p._id ?? String(Math.random()),
            lat: p.location?.latitude ?? p.lat ?? 0,
            lng: p.location?.longitude ?? p.lng ?? 0,
            rating: typeof p.rating !== 'undefined' ? p.rating : undefined,
            distance: typeof p.distance !== 'undefined' ? p.distance : undefined,
            title: getString(p.title ?? p.name ?? 'POI'),
            summary: getString(p.summary ?? p.description ?? ''),
            audioUrl: undefined,
            location: {
              latitude: p.location?.latitude ?? p.lat ?? 0,
              longitude: p.location?.longitude ?? p.lng ?? 0,
            },
            address: getString(p.address),
            contact: p.contact || undefined,
            categoryId: p.categoryId,
            status: p.status,
            visibility: p.visibility,
            isActive: p.isActive,
            reviewCount: p.reviewCount,
            stats: p.stats,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }));
          setFetchedPois(transformed);
        }
      })
      .catch(() => {
        // ignore list fetch errors; map will still work with any initialPois prop
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPoiId || selectedPoiFromList) return;

    let active = true;

    const loadPoiById = async () => {
      try {
        const language = useUserStore.getState().language || 'vi';
        const detailedPoi = await fetchDetailedPoi(
          {
            id: selectedPoiId,
            title: '',
            summary: '',
            location: { latitude: 0, longitude: 0 },
          } as POI,
          language,
        );

        if (!active) return;

        const lat = detailedPoi.lat ?? detailedPoi.location?.latitude;
        const lng = detailedPoi.lng ?? detailedPoi.location?.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        setFetchedPois((prev) => (prev.some((poi) => poi.id === detailedPoi.id) ? prev : [...prev, detailedPoi]));
      } catch {
        // ignore missing poi; map will simply keep the query state without a route
      }
    };

    loadPoiById();

    return () => {
      active = false;
    };
  }, [selectedPoiId, selectedPoiFromList]);

  // Proximity-based auto trigger (GPS mode)
  useEffect(() => {
    if (activeUserPos && filteredPois.length > 0) {
      const nearbyPois = filteredPois
        .map((p) => ({
          ...p,
          distance: getDistanceFromLatLonInMeters(
            activeUserPos[0],
            activeUserPos[1],
            p.lat!,
            p.lng!,
          ),
        }))
        .filter((p) => p.distance <= 25);

      const newNearbyIds = new Set(nearbyPois.map((p) => p.id));

      nearbyPois.forEach(async (nearbyPoi) => {
        if (!currentNearbyIdsRef.current.has(nearbyPoi.id)) {
          const language = useUserStore.getState().language || 'vi';
          try {
            const detailedPoi = await fetchDetailedPoi(nearbyPoi, language);
            onTriggerAudio(detailedPoi);
            analyticsApi.trackView(nearbyPoi.id).catch(() => {});
          } catch {
            onTriggerAudio(nearbyPoi);
          }
        }
      });

      currentNearbyIdsRef.current = newNearbyIds;
    }
  }, [activeUserPos, filteredPois, onTriggerAudio]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          try {
            const win = window as Window & {
              analyticsApi?: {
                reportLocation?: (lat: number, lng: number) => void;
              };
            };
            win.analyticsApi?.reportLocation?.(
              pos.coords.latitude,
              pos.coords.longitude,
            );
          } catch {
            // ignore
          }
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (trackingMode !== 'auto') {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== 'undefined' &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setInternalUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setTrackingMode('manual');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );

    return () => {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== 'undefined' &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [trackingMode]);

  useEffect(() => {
    const target = selectedPoi;
    if (!target) return;

    const targetLat = target.lat ?? target.location?.latitude;
    const targetLng = target.lng ?? target.location?.longitude;

    if (
      !activeUserPos ||
      typeof targetLat !== 'number' ||
      typeof targetLng !== 'number'
    ) {
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadRoute = async () => {
      setRouteLoading(true);
      setRouteError(null);
      try {
        const fromLat = activeUserPos[0];
        const fromLng = activeUserPos[1];
        const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${targetLng},${targetLat}?overview=full&geometries=geojson&steps=false`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`OSRM error ${res.status}`);
        }
        const data = (await res.json()) as OsrmRouteResponse;
        const route = data?.routes?.[0];
        if (!route) {
          throw new Error('No route returned');
        }
        if (!active) return;
        const coordinates = Array.isArray(route.geometry?.coordinates)
          ? route.geometry.coordinates.map((point) => [point[1], point[0]] as [number, number])
          : [];
        if (coordinates.length < 2) {
          throw new Error('Invalid route geometry');
        }
        setRoutePoints(coordinates);
        setRouteDistance(route.distance ?? null);
        setRouteDuration(route.duration ?? null);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        const fallbackDistance = getDistanceFromLatLonInMeters(
          activeUserPos[0],
          activeUserPos[1],
          targetLat,
          targetLng,
        );
        setRoutePoints([
          [activeUserPos[0], activeUserPos[1]],
          [targetLat, targetLng],
        ]);
        setRouteDistance(fallbackDistance);
        setRouteDuration(fallbackDistance / 1.2);
        setRouteError('fallback-straight-line');
        console.warn('Route fetch failed, falling back to straight line', err);
      } finally {
        if (active) {
          setRouteLoading(false);
        }
      }
    };

    loadRoute();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedPoi, activeUserPos]);

  const selectRouteTarget = (poi: POI) => {
    updateMapQuery({ poiId: poi.id });
  };

  const clearRoute = () => {
    setRoutePoints([]);
    setRouteDistance(null);
    setRouteDuration(null);
    setRouteError(null);
    updateMapQuery({ poiId: null });
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <header className="absolute left-0 right-0 top-0 z-20 p-4">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative"
        >
          <input
            type="text"
            placeholder={t.map.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => updateMapQuery({ search: e.target.value || null })}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-emerald-500"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        <MapFilters
          activeFilter={activeFilter}
          onFilterChange={(filter) => updateMapQuery({ categoryId: filter })}
        />

        <div className="flex items-center justify-end pointer-events-auto">
          <button
            onClick={() => setTrackingMode((prev) => (prev === 'auto' ? 'manual' : 'auto'))}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 backdrop-blur-md transition-all active:scale-95 ${
              trackingMode === 'auto'
                ? 'border-green-500/50 bg-green-500/20 text-green-400'
                : 'border-white/10 bg-zinc-900/80 text-white'
            }`}
          >
            {trackingMode === 'auto' ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <Navigation className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t.map.gpsAuto}
                </span>
              </>
            ) : (
              <>
                <MousePointer2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t.map.manualMode}
                </span>
              </>
            )}
          </button>
        </div>

        {selectedPoi && (
          <div className="mt-3 flex justify-end">
            <div className="pointer-events-auto max-w-sm rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white shadow-xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                    <LocateFixed className="h-4 w-4" />
                    Đang chỉ đường
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-white">{selectedPoi.title}</h3>
                </div>
                <button
                  onClick={clearRoute}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Clear route"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/5 px-3 py-2">
                  <div className="text-slate-400">Khoảng cách</div>
                  <div className="mt-1 font-semibold">
                    {routeLoading ? 'Đang tải...' : formatDistance(routeDistance)}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2">
                  <div className="text-slate-400">Thời gian ước tính</div>
                  <div className="mt-1 font-semibold">
                    {routeLoading ? 'Đang tải...' : formatDuration(routeDuration)}
                  </div>
                </div>
              </div>

              {!activeUserPos && (
                <p className="mt-2 text-xs text-slate-400">
                  Cần bật định vị để lấy route thực tế.
                </p>
              )}

              {routeError === 'fallback-straight-line' && (
                <p className="mt-2 text-xs text-amber-400">
                  Không lấy được route thực tế, đang hiển thị đường thẳng tạm thời.
                </p>
              )}
            </div>
          </div>
        )}
      </header>

      <MapContainer
        center={[10.762145, 106.708145]}
        zoom={16}
        scrollWheelZoom={true}
        className="h-full w-full z-10"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler
          onMapClick={onMapClick}
          trackingMode={trackingMode}
          setInternalUserPos={(pos) => setInternalUserPos(pos)}
        />

        {activeUserPos && (
          <>
            <Marker position={activeUserPos} icon={UserIcon}>
              <Popup>{t.map.yourLocation}</Popup>
            </Marker>
            <Circle
              center={activeUserPos}
              radius={25}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }}
            />
            <Circle
              center={activeUserPos}
              radius={500}
              pathOptions={{
                color: '#f97316',
                fillColor: '#f97316',
                fillOpacity: 0.03,
                dashArray: '10, 10',
                weight: 1,
                interactive: false,
              }}
            />
            <MapTracker pos={activeUserPos} />
          </>
        )}

        {routePoints.length >= 2 && <RouteLine route={routePoints} />}

        {filteredPois.map((poi) => {
          const isSelected = poi.id === selectedPoi?.id;
          const markerIcon = isSelected ? SelectedPoiIcon : PoiIcon;

          return (
            <Marker key={poi.id} position={[poi.lat!, poi.lng!]} icon={markerIcon}>
              <Popup className="custom-popup">
                <PoiPopupContent
                  poi={poi}
                  onTriggerAudio={onTriggerAudio}
                  onSelectRoute={selectRouteTarget}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
