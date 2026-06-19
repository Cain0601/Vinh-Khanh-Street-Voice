"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 12,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPois = useCallback(async () => {
    try {
      setPoisLoading(true);
      const response = await api.get(
        "/pois/owner/list?search=&status=all&page=1&limit=100"
      );
      const nextPois = ((response?.data as any)?.data || []).map((poi: any) => ({
        id: poi.id,
        name: poi.translations?.[0]?.name || "Unnamed POI",
      }));
      setPois(nextPois);
    } catch (e) {
      console.error(e);
    } finally {
      setPoisLoading(false);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/menu-items/owner/list?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=12`
      );
      setMenuItems((response?.data as any)?.data || []);
      setPagination(
        (response?.data as any)?.pagination || { total: 0, totalPages: 0, limit: 12 }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    fetchPois();
  }, [fetchPois]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleOpenModal = (
    mode: "add" | "edit" | "view" | "delete",
    item?: MenuItem
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
      setFormData({ ...emptyForm, poiId: pois[0]?.id || "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({ ...emptyForm, poiId: pois[0]?.id || "" });
  };

  const handleSave = async () => {
    if (!formData.poiId) return alert("Please select a POI");
    if (!formData.name.trim()) return alert("Please enter item name");
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
        await api.post(`/pois/${formData.poiId}/menu-items`, payload);
      } else if (modalMode === "edit" && selectedItem) {
        await api.put(`/menu-items/${selectedItem.id}`, payload);
      }
      handleCloseModal();
      setCurrentPage(1);
      fetchMenuItems();
    } catch (e) {
      console.error(e);
      alert("Failed to save menu item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/menu-items/${selectedItem.id}`);
      handleCloseModal();
      fetchMenuItems();
    } catch (e) {
      console.error(e);
      alert("Failed to delete menu item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await api.put(`/menu-items/${item.id}`, { isAvailable: !item.isAvailable });
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
            Menu Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your food items, prices, and availability.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("add")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Menu Item
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by item name, description, or restaurant..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-600 dark:text-gray-200"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 px-2">
          {loading ? "Searching..." : `${pagination.total} items found`}
        </div>
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
            <p className="text-gray-500 dark:text-gray-400">No menu items found</p>
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
                  {item.isAvailable ? "Available" : "Sold Out"}
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
                  {item.description || "No description yet."}
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
                    Toggle Status
                  </button>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Utensils className="w-3 h-3" />
                    Menu item
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
            <p className="font-bold text-gray-900 dark:text-white">Add New Item</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a new menu entry
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
              Previous
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
              Next
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
            ? "Add Menu Item"
            : modalMode === "edit"
            ? "Edit Menu Item"
            : modalMode === "view"
            ? "Menu Item Details"
            : "Delete Menu Item"
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
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </>
          ) : modalMode !== "view" ? (
            <>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || poisLoading}
                className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                Save Item
              </button>
            </>
          ) : (
            <button
              onClick={handleCloseModal}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Close
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
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                &quot;{selectedItem?.name}&quot;
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Restaurant
                </label>
                <select
                  value={formData.poiId}
                  onChange={(e) =>
                    setFormData({ ...formData, poiId: e.target.value })
                  }
                  disabled={modalMode !== "add"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                >
                  <option value="">Select restaurant</option>
                  {pois.map((poi) => (
                    <option key={poi.id} value={poi.id}>
                      {poi.name}
                    </option>
                  ))}
                </select>
                {modalMode !== "add" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Menu item belongs to a fixed restaurant.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                  placeholder="Enter item name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Price (VND)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                  placeholder="e.g. 85000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Availability
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
                  <option value="true">Available</option>
                  <option value="false">Sold Out</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none disabled:opacity-60"
                  placeholder="Paste image URL"
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
                placeholder="Describe this dish..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
