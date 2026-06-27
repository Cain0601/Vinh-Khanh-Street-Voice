"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import {
  getAdminPois,
  createAdminPoi,
  updateAdminPoi,
  updatePoiStatus,
  deleteAdminPoi,
} from "@/lib/adminApi";
import { cn } from "@/lib/cn";
import {
  MapPin,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Save,
} from "lucide-react";
// ── Load MapPicker client-side only (Leaflet is browser-only) ──
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        Đang tải bản đồ...
      </div>
    </div>
  ),
});
type LatLng = { lat: number; lng: number };
type Poi = {
  id: string;
  title?: string;
  summary?: string;
  address?: string;
  categoryId?: string;
  ownerId?: string;
  status?: string;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  mediaUrls?: string[];
  audioUrl?: string;
  location?: { latitude?: number; longitude?: number; _latitude?: number; _longitude?: number };
};
type FormState = {
  title: string;
  summary: string;
  address: string;
  categoryId: string;
  status: string;
  isActive: boolean;
  location?: LatLng;
};
const emptyForm = (): FormState => ({
  title: "",
  summary: "",
  address: "",
  categoryId: "",
  status: "approved",
  isActive: true,
  location: undefined,
});
const getPoiLatLng = (poi: Poi): LatLng | undefined => {
  if (!poi.location) return undefined;
  const lat = poi.location.latitude ?? poi.location._latitude;
  const lng = poi.location.longitude ?? poi.location._longitude;
  if (lat !== undefined && lng !== undefined) return { lat, lng };
  return undefined;
};
export default function AdminPoisPage() {
  const [pois, setPois] = useState<Poi[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  async function load() {
    setLoading(true);
    const [poisRes, catRes] = await Promise.all([getAdminPois(), getCategories()]);
    if (poisRes.success) {
      const data = poisRes.data?.items || poisRes.data;
      setPois(Array.isArray(data) ? data : []);
    }
    if (catRes.success) setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  const getCategoryName = (catId?: string) => {
    const cat = categories.find((c: any) => c.id === catId);
    return cat?.name?.vi || cat?.slug || "—";
  };
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    approved: {
      label: "Đã duyệt",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      icon: CheckCircle,
    },
    pending: {
      label: "Chờ duyệt",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      icon: Clock,
    },
    rejected: {
      label: "Từ chối",
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      icon: XCircle,
    },
  };
  // Normalize status so undefined defaults to 'pending'
  const normalizedPois = pois.map(p => ({
    ...p,
    status: p.status?.toLowerCase() || "pending"
  }));

  const filtered = normalizedPois.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const title = p.title || "";
      return (
        title.toLowerCase().includes(search.toLowerCase()) ||
        p.address?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });
  const stats = {
    total: normalizedPois.length,
    approved: normalizedPois.filter((p) => p.status === "approved").length,
    pending: normalizedPois.filter((p) => p.status === "pending").length,
    rejected: normalizedPois.filter((p) => p.status === "rejected").length,
  };
  function openCreate() {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  }
  function openEdit(poi: Poi) {
    setEditId(poi.id);
    setForm({
      title: poi.title || "",
      summary: poi.summary || "",
      address: poi.address || "",
      categoryId: poi.categoryId || "",
      status: poi.status || "approved",
      isActive: poi.isActive,
      location: getPoiLatLng(poi),
    });
    setShowForm(true);
  }
  async function handleSave() {
    if (!form.title) return;
    setSaving(true);
    const payload = {
      ...form,
      location: form.location
        ? { lat: form.location.lat, lng: form.location.lng }
        : undefined,
    };
    if (editId) {
      await updateAdminPoi(editId, payload);
    } else {
      await createAdminPoi(payload);
    }
    setSaving(false);
    setShowForm(false);
    await load();
  }
  async function handleStatusChange(id: string, status: string) {
    await updatePoiStatus(id, status);
    await load();
  }
  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xóa địa điểm này?")) return;
    await deleteAdminPoi(id);
    await load();
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý địa điểm</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pois.length} địa điểm trong hệ thống
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
          <Plus size={16} />
          Thêm địa điểm
        </button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng cộng", value: stats.total, color: "text-blue-400" },
          { label: "Đã duyệt", value: stats.approved, color: "text-emerald-400" },
          { label: "Chờ duyệt", value: stats.pending, color: "text-amber-400" },
          { label: "Từ chối", value: stats.rejected, color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-secondary/50 border border-white/[0.06] px-4 py-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-0.5", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc địa chỉ..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/[0.06] rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "approved", "pending", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-colors border",
                statusFilter === s
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-white/[0.02] text-muted-foreground border-white/[0.06] hover:bg-white/[0.04]",
              )}>
              {s === "all" ? "Tất cả" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>
      {/* Table */}
      <div className="rounded-2xl bg-secondary/50 border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Địa điểm
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((poi) => {
                  const st = statusConfig[poi.status?.toLowerCase() || ""] || statusConfig.pending;
                  const StIcon = st.icon;
                  return (
                    <tr
                      key={poi.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
                            {poi.mediaUrls?.[0] ? (
                              <img
                                src={poi.mediaUrls[0]}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <MapPin size={18} className="text-emerald-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {poi.title || `POI ${poi.id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {poi.address || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                          {getCategoryName(poi.categoryId)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border",
                            st.color,
                          )}>
                          <StIcon size={10} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-xs">★</span>
                          <span className="text-sm text-foreground">
                            {poi.rating?.toFixed(1) || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({poi.reviewCount || 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {poi.status === 'pending' && (
                            <>
                              <button
                                onClick={async () => {
                                  if (confirm("Duyệt POI này?")) {
                                    const res = await updatePoiStatus(poi.id, 'approved');
                                    if (res.success) load();
                                  }
                                }}
                                className="p-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors"
                                title="Duyệt">
                                <Check size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("Từ chối POI này?")) {
                                    const res = await updatePoiStatus(poi.id, 'rejected');
                                    if (res.success) load();
                                  }
                                }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                title="Từ chối">
                                <X size={16} />
                              </button>
                              <div className="w-px h-4 bg-white/[0.1] mx-1"></div>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedPoi(poi)}
                            className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                            title="Xem">
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(poi)}
                            className="p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                            title="Sửa">
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(poi.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Xóa">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-muted-foreground">
                      Không tìm thấy địa điểm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative w-full max-w-xl bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#131b2e]">
              <h3 className="text-lg font-semibold text-foreground">
                {editId ? "Sửa địa điểm" : "Thêm địa điểm mới"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Tên địa điểm *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="Bún Bò Huế Cô Ba"
                />
              </div>
              {/* Summary */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Mô tả ngắn</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="Quán bún bò nổi tiếng hơn 30 năm trên đường Vĩnh Khánh..."
                />
              </div>
              {/* Address */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Địa chỉ</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="123 Vĩnh Khánh, Quận 4, TP.HCM"
                />
              </div>
              {/* Category */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Danh mục</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all">
                  <option value="">— Chọn danh mục —</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name?.vi || cat.slug}
                    </option>
                  ))}
                </select>
              </div>
              {/* Status buttons */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Trạng thái</label>
                <div className="flex gap-2">
                  {["approved", "pending", "rejected"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all",
                        form.status === s
                          ? statusConfig[s]?.color ||
                              "bg-white/[0.06] text-foreground border-white/[0.1]"
                          : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.04]",
                      )}>
                      {statusConfig[s]?.label || s}
                    </button>
                  ))}
                </div>
              </div>
              {/* ── MAP PICKER ── */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">
                  Vị trí trên bản đồ
                  <span className="ml-1.5 text-emerald-500">★</span>
                </label>
                <MapPicker
                  value={form.location}
                  onChange={(pos) => setForm((f) => ({ ...f, location: pos }))}
                />
              </div>
              
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                <Save size={16} />
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── POI Detail Modal ── */}
      {selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPoi(null)}
          />
          <div className="relative w-full max-w-lg bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#131b2e]">
              <h3 className="text-lg font-semibold text-foreground">Chi tiết địa điểm</h3>
              <button
                onClick={() => setSelectedPoi(null)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tên</p>
                <p className="text-foreground font-medium">{selectedPoi.title || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mô tả</p>
                <p className="text-foreground text-sm">{selectedPoi.summary || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Địa chỉ</p>
                <p className="text-foreground">{selectedPoi.address || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Danh mục</p>
                  <p className="text-sm text-foreground">
                    {getCategoryName(selectedPoi.categoryId)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
                  <p className="text-sm text-foreground capitalize">{selectedPoi.status || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Đánh giá</p>
                  <p className="text-sm text-foreground">
                    ★ {selectedPoi.rating?.toFixed(1) || "—"} ({selectedPoi.reviewCount || 0})
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground mb-1">Tọa độ</p>
                  {(() => {
                    const ll = getPoiLatLng(selectedPoi);
                    return ll ? (
                      <p className="text-xs text-foreground font-mono">
                        {ll.lat.toFixed(5)}, {ll.lng.toFixed(5)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Chưa có</p>
                    );
                  })()}
                </div>
              </div>
              {selectedPoi.audioUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Audio</p>
                  <audio controls src={selectedPoi.audioUrl} className="w-full" />
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID</p>
                <p className="text-xs text-muted-foreground font-mono">{selectedPoi.id}</p>
              </div>
              {/* Quick status */}
              <div className="flex gap-2 pt-2">
                {selectedPoi.status?.toLowerCase() !== "approved" && (
                  <button
                    onClick={async () => {
                      await handleStatusChange(selectedPoi.id, "approved");
                      setSelectedPoi(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                    <Check size={14} /> Duyệt
                  </button>
                )}
                {selectedPoi.status?.toLowerCase() !== "rejected" && (
                  <button
                    onClick={async () => {
                      await handleStatusChange(selectedPoi.id, "rejected");
                      setSelectedPoi(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors">
                    <XCircle size={14} /> Từ chối
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
