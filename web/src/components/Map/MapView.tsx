'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, MousePointer2 } from 'lucide-react';
import { getPois } from '@/lib/api'
import { useSearchParams } from 'next/navigation';
import MapFilters from './MapFilters';

// Haversine formula to calculate distance between two lat/lng points in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in m
  return d;
}

// Helper to extract localized string if object is returned
function getString(value: any, lang: 'vi' | 'en' = 'vi'): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[lang] || value['en'] || Object.values(value)[0] as string || '';
  }
  return String(value);
}

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// apply default icon globally so any Marker without explicit icon uses this
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

// Component to handle map clicks for demo positioning
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
      if (typeof trackingMode !== 'undefined' && trackingMode === 'manual') {
        // In manual mode, set the internal user position to the clicked point
        setInternalUserPos?.([lat, lng]);
      }
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    },
  });
  return null;
}

// Component to handle map centering and auto-zoom
function MapTracker({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyTo(pos, 17, { animate: true });
    }
  }, [pos, map]);
  return null;
}

export interface POI {
  id: string;
  lat: number;
  lng: number;
  rating: number;
  distance: number;
  translation: {
    name: string;
    description: string;
    specialties: string;
    priceRange: string;
    audioUrl?: string;
    imageUrl?: string;
  };
}

interface TourMapProps {
  userPos: [number, number] | null;
  pois: POI[];
  onTriggerAudio: (poi: POI) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function TourMap({ userPos, pois: initialPois, onTriggerAudio, onMapClick }: TourMapProps) {
  const currentNearbyIdsRef = useRef<Set<string>>(new Set());
  const watchIdRef = useRef<number | null>(null);
  const [trackingMode, setTrackingMode] = useState<'auto' | 'manual'>('auto');
  const [internalUserPos, setInternalUserPos] = useState<[number, number] | null>(userPos ?? null);
  const [pois, setPois] = useState<POI[]>(initialPois ?? []);
  const [loading, setLoading] = useState(false);

  
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showList, setShowList] = useState(!!initialSearch)

  // keep internal user pos in sync with parent-provided userPos
  useEffect(() => {
    setInternalUserPos(userPos ?? null);
  }, [userPos]);

  useEffect(() => {
    // If parent provided pois, use them; otherwise fetch from API
    if (initialPois && initialPois.length > 0) {
      setPois(initialPois)
      return
    }

    let mounted = true
    setLoading(true)
    getPois().then((res) => {
      if (!mounted) return
      if (res.success && Array.isArray(res.data)) {
        // Map API shape into POI type if necessary
        const transformed = (res.data as any[]).map((p) => ({
          id: p.id ?? p.poiId ?? p._id ?? String(Math.random()),
          lat: p.location?.latitude ?? p.lat ?? (p.location ? p.location.lat : undefined) ?? 0,
          lng: p.location?.longitude ?? p.lng ?? (p.location ? p.location.lng : undefined) ?? 0,
          rating: p.rating ?? 0,
          distance: p.distance ?? 0,
          translation: {
            name: getString(p.title ?? p.name ?? p.translation?.name ?? 'POI'),
            description: getString(p.summary ?? p.description ?? p.translation?.description ?? ''),
            specialties: getString(p.specialties ?? ''),
            priceRange: getString(p.priceRange ?? ''),
            audioUrl: getString(p.audioUrl ?? p.translation?.audioUrl),
            imageUrl: getString(p.imageUrl ?? p.translation?.imageUrl),
          }
        }))
        setPois(transformed)
      }
    }).finally(() => {
      setLoading(false)
    })

    return () => { mounted = false }
  }, [initialPois])

  useEffect(() => {
    if (internalUserPos && pois.length > 0) {
      // Find all POIs within 25m range dynamically
      const nearbyPois = pois.map(p => ({
        ...p,
        distance: getDistanceFromLatLonInMeters(internalUserPos[0], internalUserPos[1], p.lat, p.lng)
      })).filter(p => p.distance <= 25);

      const newNearbyIds = new Set(nearbyPois.map(p => p.id));

      nearbyPois.forEach(nearbyPoi => {
        if (!currentNearbyIdsRef.current.has(nearbyPoi.id)) {
          onTriggerAudio(nearbyPoi);
        }
      });

      currentNearbyIdsRef.current = newNearbyIds;
    }
  }, [internalUserPos, pois, onTriggerAudio]);

  // Handle Heartbeat and Offline signaling
  useEffect(() => {
    // Note: PoiAudioDrawer also has a heartbeat when open, 
    // but this ensures online status even when drawer is closed.
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          try {
            (window as any).analyticsApi?.reportLocation?.(pos.coords.latitude, pos.coords.longitude);
          } catch (err) {
            // ignore analytics errors
          }
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Watch position when in 'auto' tracking mode
  useEffect(() => {
    if (trackingMode !== 'auto') {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      setTrackingMode('manual');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setInternalUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setTrackingMode('manual');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [trackingMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // setShowList(true)
  }
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 p-4">
        {/* Search Input */}
              {/* <div className="bg-slate-800 border-b border-slate-700 px-4 py-3"> */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Tìm quán ăn gần đây..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // onFocus={() => setShowList(true)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-emerald-500 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </button>
                </form>
              {/* </div> */}
        
              {/* Filters */}
              {!showList && <MapFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />}
        <div className="flex items-center justify-end pointer-events-auto">
          <button
            onClick={() => setTrackingMode(prev => prev === 'auto' ? 'manual' : 'auto')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-md transition-all active:scale-95 ${
              trackingMode === 'auto'
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-zinc-900/80 border-white/10 text-white'
            }`}
          >
            {trackingMode === 'auto' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <Navigation className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">GPS: Auto</span>
              </>
            ) : (
              <>
                <MousePointer2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Manual Click</span>
              </>
            )}
          </button>
        </div>
      </header>
      <MapContainer
        center={[10.762145, 106.708145]} // Initial center at Vinh Khanh street
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onMapClick={onMapClick} trackingMode={trackingMode} setInternalUserPos={(pos) => setInternalUserPos(pos)} />

        {internalUserPos && (
          <>
            <Marker position={internalUserPos} icon={UserIcon}>
              <Popup>Vị trí của bạn</Popup>
            </Marker>
            <Circle 
                center={internalUserPos} 
                radius={25} 
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }} 
            />
            {/* POI Loading Range Circle (500m) */}
            <Circle 
                center={internalUserPos} 
                radius={500} 
                pathOptions={{ 
                  color: '#f97316', 
                  fillColor: '#f97316', 
                  fillOpacity: 0.03, 
                  dashArray: '10, 10',
                  weight: 1,
                  interactive: false
                }} 
            />
            <MapTracker pos={internalUserPos} />
          </>
        )}

        {pois.map((poi) => (
          <Marker 
            key={poi.id} 
            position={[poi.lat, poi.lng]} 
            icon={PoiIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-orange-600">{poi.translation.name}</h3>
                <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{poi.translation.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <MapPin size={12} />
                  <span>Cách bạn {poi.distance}m</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
