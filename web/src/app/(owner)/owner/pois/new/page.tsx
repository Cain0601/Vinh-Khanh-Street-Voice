"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoi } from "@/lib/api";
import { useUserStore } from "@/store/userStore";


export default function NewPoiPage() {
  const router = useRouter();
  const {user} = useUserStore();
  const [form, setForm] = useState({ title: "", summary: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await createPoi({
      title: form.title,
      summary: form.summary || undefined,
      address: form.address || undefined,
      ownerId: user?.id || undefined,
    });
    setSubmitting(false);
    if (res.success) {
      router.push("/owner/pois");
    } else {
      setError(res.message ?? "Failed to create POI");
    }
  }

  return (
    <section className="container max-w-lg py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Place</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="e.g. Bánh Mì Phượng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Summary
          </label>
          <textarea
            value={form.summary}
            onChange={(e) =>
              setForm((f) => ({ ...f, summary: e.target.value }))
            }
            rows={3}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Short description of the place"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="e.g. 2B Phan Chu Trinh, Hội An"
          />
        </div>

        {error && (
          <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Place"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
