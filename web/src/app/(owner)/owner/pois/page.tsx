"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOwnerPois } from "@/lib/api";


type Poi = {
  id: string;
  title?: string;
  name?: string;
  address?: string;
  status?: string;
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
        {pois.map((poi) => (
          <li
            key={poi.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Link
              href={`/owner/pois/${poi.id}`}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {poi.title ?? poi.name ?? poi.id}
                </p>
                {poi.address && (
                  <p className="text-sm text-slate-500">{poi.address}</p>
                )}
              </div>
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
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
