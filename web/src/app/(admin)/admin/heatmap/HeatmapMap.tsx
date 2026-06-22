"use client";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { HeatPoint } from "./page";

function colorFor(ratio: number) {
  // green -> yellow -> red
  if (ratio < 0.5) {
    const t = ratio / 0.5;
    return `rgb(${Math.round(16 + t * (250 - 16))}, ${Math.round(185 - t * 20)}, ${Math.round(129 - t * 100)})`;
  }
  const t = (ratio - 0.5) / 0.5;
  return `rgb(${Math.round(250)}, ${Math.round(165 - t * 165)}, ${Math.round(29 - t * 29)})`;
}

export default function HeatmapMap({
  points,
  maxIntensity,
}: {
  points: HeatPoint[];
  maxIntensity: number;
}) {
  const center: [number, number] = points.length
    ? [points[0].lat, points[0].lng]
    : [10.762145, 106.708145];

  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom className="w-full h-[60vh]">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {points.map((p) => {
        const ratio = p.intensity / maxIntensity;
        const radius = 12 + ratio * 28;
        const color = colorFor(ratio);
        return (
          <CircleMarker
            key={p.poiId}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.45, weight: 1 }}>
            <Tooltip direction="top">
              <div className="text-xs">
                <b>{p.title || p.poiId}</b>
                <br />
                {p.intensity} lượt tương tác
                <br />({p.views} xem · {p.listens} nghe · {p.scans} quét QR)
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
