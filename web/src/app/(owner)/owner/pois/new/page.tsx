"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPoi, getCategories, uploadPoiImage } from "@/lib/api/owner";
import { useUserStore } from "@/store/userStore";
import MapPicker from "@/components/MapPicker";

type LatLng = { lat: number; lng: number };
type Category = { id: string; name?: string | any; title?: string; slug?: string };

export default function NewPoiPage() {
  const router = useRouter();
  const { user } = useUserStore();

  const [form, setForm] = useState({ title: "", summary: "", address: "", categoryId: "" });
  const [location, setLocation] = useState<LatLng | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackCategories: Category[] = [
    { id: "restaurant", name: "Nhà hàng" },
    { id: "coffee-shop", name: "Quán cà phê" },
    { id: "street-food", name: "Đồ ăn đường phố" },
    { id: "bar", name: "Quán bar" },
    { id: "hotel", name: "Khách sạn" },
    { id: "dessert", name: "Tráng miệng" },
    { id: "bakery", name: "Tiệm bánh" },
    { id: "market", name: "Chợ" },
    { id: "attraction", name: "Điểm tham quan" },
    { id: "spa", name: "Spa" },
  ];
  const categoryOptions = categories.length > 0 ? categories : fallbackCategories;

  useEffect(() => {
    (async () => {
      const res = await getCategories();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data as Category[]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  async function handleReverseGeocode(pos: LatLng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json&accept-language=vi`,
      );
      const data = await res.json();
      if (data?.display_name) setForm((f) => ({ ...f, address: data.display_name }));
    } catch {
      // ignore
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Tên địa điểm là bắt buộc.");
      return;
    }
    if (!form.categoryId.trim()) {
      setError("Vui lòng chọn danh mục.");
      return;
    }
    if (!location) {
      setError("Vui lòng chọn vị trí trên bản đồ.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        title: form.title,
        summary: form.summary || undefined,
        address: form.address || undefined,
        ownerId: user?.id || undefined,
        categoryId: form.categoryId || undefined,
        location: { lat: location.lat, lng: location.lng },
      };

      const res = await createPoi(payload);
      if (!res.success || !res.data) {
        setError(res.message ?? "Tạo địa điểm thất bại.");
        return;
      }

      const poiId = (res.data as any).id || (res.data as any)?.id;
      if (poiId && imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await uploadPoiImage(poiId, imageFile);
        if (!uploadRes.success) {
          setError(uploadRes.message ?? "Đã tạo địa điểm nhưng upload ảnh thất bại.");
          return;
        }
      }

      router.push("/owner/pois");
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container mx-auto max-w-4xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Owner</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Add New Place</h1>
          <p className="mt-2 text-sm text-slate-600">
            Tạo mới địa điểm của bạn với thông tin cơ bản, chọn danh mục và vị trí trên bản đồ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Place Name</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tên địa điểm"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">Chọn danh mục</option>
                    {categoryOptions.map((category) => {
                      const label =
                        typeof category.name === "string"
                          ? category.name
                          : (category.name as any)?.vi || (category.name as any)?.en || category.title || category.slug || category.id;
                      return (
                        <option key={category.id} value={category.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Ví dụ: 2B Phan Chu Trinh, Hội An"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả ngắn về địa điểm"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Place Photo</label>
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex h-56 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-slate-400">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm">No image selected yet</span>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-3xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    Choose Image
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Select Location</label>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <MapPicker
                    value={location ?? undefined}
                    onChange={(pos) => {
                      setLocation(pos);
                      handleReverseGeocode(pos);
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Latitude</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {location ? location.lat.toFixed(6) : "--"}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Longitude</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {location ? location.lng.toFixed(6) : "--"}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Selected location</p>
                <p className="mt-2 text-sm text-slate-600">
                  {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Chưa chọn vị trí"}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Place"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}