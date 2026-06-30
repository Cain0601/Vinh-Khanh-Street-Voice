"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  QrCode,
  Download,
  Printer,
  Share2,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
  Loader,
  MapPin,
  X,
} from "lucide-react";
import { getOwnerPois } from "@/lib/api/owner";

interface PoiItem {
  id: string;
  title?: string;
  address?: string;
  imageUrls?: string[];
  translations?: Array<{ name?: string; imageUrl?: string }>;
}

const QR_SIZE = 260;

const getPoiTranslation = (poi?: PoiItem | null) => poi?.translations?.[0] ?? { name: undefined, imageUrl: undefined };

export default function QRCodePage() {
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoiId, setSelectedPoiId] = useState<string>("");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [onlyWithImage, setOnlyWithImage] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const fetchPois = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOwnerPois({
        search: "",
        status: "all",
        page: 1,
        limit: 100,
      });
      // Handle nested data structure: response?.data?.data || response?.data
      const nextPois: PoiItem[] = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      setPois(nextPois);
      if (!selectedPoiId && nextPois.length > 0) {
        setSelectedPoiId(nextPois[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch POIs:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPoiId]);

  useEffect(() => {
    fetchPois();
  }, [fetchPois]);

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  const filteredPois = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return pois.filter((poi) => {
      const translation = getPoiTranslation(poi);
      const name = poi.title || translation.name || "Unnamed POI";
      const imageUrl = poi.imageUrls?.[0] || translation.imageUrl;
      const matchesSearch = !keyword || name.toLowerCase().includes(keyword);
      const matchesImageFilter = !onlyWithImage || Boolean(imageUrl);
      return matchesSearch && matchesImageFilter;
    });
  }, [pois, searchQuery, onlyWithImage]);

  useEffect(() => {
    if (!filteredPois.length) return;
    const selectedStillVisible = filteredPois.some((poi) => poi.id === selectedPoiId);
    if (!selectedStillVisible) {
      setSelectedPoiId(filteredPois[0].id);
    }
  }, [filteredPois, selectedPoiId]);

  const selectedPoi =
    filteredPois.find((poi) => poi.id === selectedPoiId) || filteredPois[0] || null;

  const restaurantName =
    selectedPoi?.title || getPoiTranslation(selectedPoi).name || "Select a restaurant";
  const directLink =
    selectedPoi && siteOrigin ? `${siteOrigin}/poi/${selectedPoi.id}?src=qr` : "";
  const qrImageUrl = selectedPoi
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(directLink)}`
    : "";

  const handleCopy = async () => {
    if (!directLink) return;
    await navigator.clipboard.writeText(directLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (!directLink) return;
    window.open(directLink, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    if (!directLink) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: restaurantName,
          text: `QR code for ${restaurantName}`,
          url: directLink,
        });
      } else {
        await handleCopy();
        alert("Link copied. You can paste it to share.");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const handleDownload = async () => {
    if (!qrImageUrl) return;
    const response = await fetch(qrImageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${selectedPoi?.id || "restaurant"}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    if (!selectedPoi || !qrImageUrl) return;
    setIsPrinting(true);
    try {
      const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR - ${restaurantName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 32px; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; }
              .card { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 45px rgba(0,0,0,0.12); text-align: center; }
              img { width: 320px; height: 320px; object-fit: contain; }
              h1 { font-size: 24px; margin: 0 0 8px; }
              p { margin: 0; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${restaurantName}</h1>
              <p>${directLink}</p>
              <div style="height:24px"></div>
              <img src="${qrImageUrl}" alt="QR Code" />
            </div>
            <script>
              window.onload = () => { window.print(); setTimeout(() => window.close(), 250); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            QR Code Generation
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Generate and manage QR codes for your restaurant pages.
          </p>
        </div>
        <button
          onClick={fetchPois}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Regenerate All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Select Location
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {filteredPois.length} Total
            </span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-700 dark:text-gray-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {onlyWithImage && (
              <span className="text-xs px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                With image only
              </span>
            )}
          </div>

          {filterOpen && (
            <div className="mb-4 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => {
                  setOnlyWithImage((prev) => !prev);
                  setFilterOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                Toggle: locations with image
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader className="w-5 h-5 animate-spin mr-2" /> Loading locations...
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredPois.map((poi) => {
                const translation = getPoiTranslation(poi);
                const poiName = poi.title || translation.name || "Unnamed POI";
                const imageUrl = poi.imageUrls?.[0] || translation.imageUrl;
                return (
                  <button
                    key={poi.id}
                    onClick={() => setSelectedPoiId(poi.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all group ${
                      selectedPoi?.id === poi.id
                        ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 shadow-sm"
                        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-orange-100 dark:hover:border-orange-500/20 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={poiName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <MapPin className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p
                        className={`font-bold text-sm truncate transition-colors ${
                          selectedPoi?.id === poi.id
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {poiName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        POI ID: {poi.id.slice(0, 8)}
                      </p>
                    </div>
                  </button>
                );
              })}

              {!filteredPois.length && (
                <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                  No locations match your search.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-orange-500/5 rounded-[2.5rem] scale-95 group-hover:scale-100 transition-transform duration-500"></div>
              <div className="relative w-64 h-64 bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl border border-gray-50 dark:border-gray-800 flex items-center justify-center">
                <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden">
                  {selectedPoi ? (
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <QrCode className="w-14 h-14 mx-auto mb-3" />
                      <p className="text-sm font-medium">Select a location</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {restaurantName}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                This QR code links directly to your location's public profile page where customers can view your menu and specialties.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-10 w-full max-w-lg">
              <button
                onClick={handleDownload}
                disabled={!selectedPoi}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
              <button
                onClick={handlePrint}
                disabled={!selectedPoi || isPrinting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPrinting ? <Loader className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                Print PDF
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Direct Link & Sharing
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value={directLink}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 outline-none"
                />
                <button
                  onClick={handleCopy}
                  disabled={!selectedPoi}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-60"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  disabled={!selectedPoi}
                  className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all disabled:opacity-60"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleOpen}
                  disabled={!selectedPoi}
                  className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all disabled:opacity-60"
                  title="Open link"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Selected Location
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {restaurantName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  QR target: {selectedPoi ? `/poi/${selectedPoi.id}` : "No target selected"}
                </p>
              </div>
              <QrCode className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
