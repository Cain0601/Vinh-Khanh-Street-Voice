"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Utensils,
  Loader,
  MapPin,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Modal } from "../components/Modal";
import { api } from "@/lib/api";

interface PoiOption {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  poiId: string;
  name: string;
  price: number | string;
  isAvailable: boolean;
  description?: string | null;
  imageUrl?: string | null;
  poi?: { id: string; translations?: Array<{ name: string }> };
}

const emptyForm = {
  poiId: "",
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  isAvailable: true,
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pois, setPois] = useState<PoiOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [poisLoading, setPoisLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoiId, setSelectedPoiId] = useState<string>("");
  const [poiReviewCount, setPoiReviewCount] = useState(0);
  const [poiAverageRating, setPoiAverageRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 12,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "delete"
  >("add");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPois = useCallback(async () => {
    try {
      setPoisLoading(true);
      const response = await api.get(
        "/pois/owner/list?search=&status=all&page=1&limit=100",
      );
      const nextPois = ((response?.data as any)?.data || []).map(
        (poi: any) => ({
          id: poi.id,
          name: poi.translations?.[0]?.name || "Unnamed POI",
        }),
      );
      setPois(nextPois);
      if (!selectedPoiId && nextPois.length > 0) {
        setSelectedPoiId(nextPois[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPoisLoading(false);
    }
  }, [selectedPoiId]);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedPoiId) params.set("poiId", selectedPoiId);
      params.set("page", String(currentPage));
      params.set("limit", "12");

      const response = await api.get(
        `/menu-items/owner/list?${params.toString()}`,
      );
      setMenuItems((response?.data as any)?.data || []);
      setPagination(
        (response?.data as any)?.pagination || {
          total: 0,
          totalPages: 0,
          limit: 12,
        },
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, selectedPoiId]);

  const fetchPoiReviews = useCallback(async () => {
    if (!selectedPoiId) {
      setPoiReviewCount(0);
      setPoiAverageRating(0);
      return;
    }

    try {
      const response = await api.get(`/pois/${selectedPoiId}/reviews`);
      const data = response as any;
      if (data?.success) {
        setPoiReviewCount(Array.isArray(data.data) ? data.data.length : 0);
        setPoiAverageRating(data.averageRating ?? 0);
      } else {
        setPoiReviewCount(0);
        setPoiAverageRating(0);
      }
    } catch (error) {
      console.error(error);
      setPoiReviewCount(0);
      setPoiAverageRating(0);
    }
  }, [selectedPoiId]);

  useEffect(() => {
    fetchPois();
  }, [fetchPois]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    fetchPoiReviews();
  }, [fetchPoiReviews]);

  const handleOpenModal = (
    mode: "add" | "edit" | "view" | "delete",
    item?: MenuItem,
  ) => {
    setModalMode(mode);
    setSelectedItem(item || null);
    if (item) {
      setFormData({
        poiId: item.poiId,
        name: item.name,
        price: String(item.price || ""),
        description: item.description || "",
        imageUrl: item.imageUrl || "",
        isAvailable: item.isAvailable,
      });
    } else {
      setFormData({ ...emptyForm, poiId: selectedPoiId || pois[0]?.id || "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({ ...emptyForm, poiId: pois[0]?.id || "" });
  };

  const handleSave = async () => {
    const targetPoiId = formData.poiId || selectedPoiId;
    if (!targetPoiId) return alert("Vui lòng chọn quán.");
    if (!formData.name.trim()) return alert("Vui lòng nhập tên món ăn.");
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        imageUrl: formData.imageUrl,
        isAvailable: formData.isAvailable,
      };
      if (modalMode === "add") {
        await api.post(`/pois/${targetPoiId}/menu-items`, payload);
      } else if (modalMode === "edit" && selectedItem) {
        await api.put(`/menu-items/${selectedItem.id}`, payload);
      }
      handleCloseModal();
      setCurrentPage(1);
      fetchMenuItems();
      if (selectedPoiId === targetPoiId) {
        await fetchPoiReviews();
      }
    } catch (e) {
      console.error(e);
      alert("Lưu món ăn không thành công.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/menu-items/${selectedItem.id}`);
      handleCloseModal();
      await fetchMenuItems();
    } catch (e) {
      console.error(e);
      alert("Xóa món không thành công.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await api.put(`/menu-items/${item.id}`, {
        isAvailable: !item.isAvailable,
      });
      fetchMenuItems();
    } catch (e) {
      console.error(e);
    }
  };

  const getRestaurantName = (item: MenuItem) =>
    item.poi?.translations?.[0]?.name || "Unknown POI";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý Cửa hàng
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Thay đổi thực đơn và theo dõi phản hồi cho quán của bạn.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("add")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" /> Thêm món mới
        </button>
      </div>

      {/* Search bar and POI filter */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm grid gap-4 md:grid-cols-[1.5fr_1fr] transition-colors">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên món, mô tả hoặc quán..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-600 dark:text-gray-200"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Chọn quán
            <select
              value={selectedPoiId}
              onChange={(e) => {
                setSelectedPoiId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            >
              {pois.map((poi) => (
                <option key={poi.id} value={poi.id}>
                  {poi.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="text-slate-500">Phản hồi quán</div>
            <div className="text-xl font-bold text-slate-900">
              {poiAverageRating.toFixed(1)} ★
            </div>
            <div className="text-slate-500">{poiReviewCount} đánh giá</div>
            {selectedPoiId && (
              <Link
                href={`/owner/pois/${selectedPoiId}`}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Xem Quản lý Cửa hàng
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        {loading ? "Đang tìm..." : `${pagination.total} món ăn`}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading && (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        )}

        {!loading && menuItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Utensils className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có món ăn nào trong menu.
            </p>
          </div>
        )}

        {!loading &&
          menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Utensils className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleOpenModal("edit", item)}
                    className="p-2 bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:text-orange-500 rounded-xl shadow-sm transition-all hover:scale-110"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal("view", item)}
                    className="p-2 bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:text-blue-500 rounded-xl shadow-sm transition-all hover:scale-110"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal("delete", item)}
                    className="p-2 bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:text-red-500 rounded-xl shadow-sm transition-all hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${
                    item.isAvailable
                      ? "bg-green-500/80 text-white"
                      : "bg-red-500/80 text-white"
                  }`}
                >
                  {item.isAvailable ? "Đang phục vụ" : "Tạm ẩn"}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-orange-600 dark:text-orange-500 font-bold whitespace-nowrap">
                    ₫{Number(item.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {getRestaurantName(item)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6">
                  {item.description || "Chưa có mô tả."}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      item.isAvailable
                        ? "text-green-600 hover:text-green-700"
                        : "text-red-600 hover:text-red-700"
                    }`}
                  >
                    {item.isAvailable ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Đổi trạng thái
                  </button>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Utensils className="w-3 h-3" />
                    Món
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Add card */}
        <button
          onClick={() => handleOpenModal("add")}
          className="bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-orange-300 hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-all group min-h-[350px]"
        >
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-orange-500 group-hover:scale-110 transition-all shadow-sm">
            <Plus className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">
              Thêm món mới
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tạo món mới cho thực đơn quán
            </p>
          </div>
        </button>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalMode === "add"
            ? "Thêm món mới"
            : modalMode === "edit"
              ? "Chỉnh sửa món"
              : modalMode === "view"
                ? "Chi tiết món"
                : "Xóa món"
        }
        size={modalMode === "delete" ? "sm" : "lg"}
        footer={
          modalMode === "delete" ? (
            <>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                Xóa
              </button>
            </>
          ) : modalMode !== "view" ? (
            <>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || poisLoading}
                className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                Lưu món
              </button>
            </>
          ) : (
            <button
              onClick={handleCloseModal}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Đóng
            </button>
          )
        }
      >
        {modalMode === "delete" ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Bạn có chắc muốn xóa món
              <span className="font-bold text-gray-900 dark:text-white">
                &quot;{selectedItem?.name}&quot;
              </span>
              ? Hành động này không thể hoàn tác.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Quán
                </label>
                <select
                  value={formData.poiId}
                  onChange={(e) =>
                    setFormData({ ...formData, poiId: e.target.value })
                  }
                  disabled={modalMode !== "add"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                >
                  <option value="">Chọn quán</option>
                  {pois.map((poi) => (
                    <option key={poi.id} value={poi.id}>
                      {poi.name}
                    </option>
                  ))}
                </select>
                {modalMode !== "add" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Món ăn thuộc về quán đã chọn và không thể đổi khi chỉnh sửa.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Tên món
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                  placeholder="Nhập tên món"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                  placeholder="Ví dụ: 85000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Trạng thái
                </label>
                <select
                  value={String(formData.isAvailable)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isAvailable: e.target.value === "true",
                    })
                  }
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                >
                  <option value="true">Đang phục vụ</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  URL ảnh
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                  placeholder="Dán URL ảnh"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={modalMode === "view"}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60 resize-none"
                placeholder="Mô tả món ăn..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
