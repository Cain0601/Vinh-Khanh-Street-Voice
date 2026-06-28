"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOwnerPois } from "@/lib/api/owner";

type Poi = {
  id: string;
  title?: string;
  name?: string;
  address?: string;
  status?: string;
  imageUrl?: string;
  imageUrls?: string[];
  mediaUrl?: string;
  mediaUrls?: string[];
  // Đã bổ sung trường này để không bị lỗi build "Property 'translations' does not exist"
  translations?: Array<{
    imageUrl?: string;
    [key: string]: any;
  }>;
};

export default function OwnerPoisPage() {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load(q?: string) {
    setLoading(true);
    setError(null);
    const res = await getOwnerPois({ search: q, limit: 50 });
    if (res.success && res.data) {
      setPois((res.data.data as Poi[]) ?? []);
    } else {
      setError(res.message ?? "Failed to load POIs");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Places</h1>
        <Link
          href="/owner/pois/new"
          className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          + New POI
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={() => load(search)}
          className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading...</p>}
      {error && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {!loading && !error && pois.length === 0 && (
        <p className="text-slate-500 text-sm">
          No places yet. Create your first POI!
        </p>
      )}

      <ul className="space-y-3">
        {pois.map((poi) => {
          const coverImage =
            poi.mediaUrls?.[0] ||
            poi.imageUrls?.find(Boolean) ||
            poi.mediaUrl ||
            poi.imageUrl ||
            (poi as any).MediaUrls?.[0] ||
            (poi as any).ImageUrl ||
            poi.translations?.[0]?.imageUrl ||
            undefined;
          const initial = (poi.title || poi.name || poi.id || "?").charAt(0).toUpperCase();

          return (
            <li
              key={poi.id}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <Link href={`/owner/pois/${poi.id}`} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={poi.title ?? poi.name ?? "poi"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold uppercase">
                      {initial}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {poi.title ?? poi.name ?? poi.id}
                  </p>
                  {poi.address && (
                    <p className="text-sm text-slate-500 truncate">{poi.address}</p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      poi.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : poi.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {poi.status ?? "—"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}