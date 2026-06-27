'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit2, Plus, Repeat, Star, Trash2 } from 'lucide-react';
import Modal from '../../../components/Modal';
import api, { getPoi } from '@/lib/api';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  isAvailable?: boolean;
  imageUrl?: string | null;
};

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
};

type ReviewApiResponse = {
  success: boolean;
  data: Review[];
  averageRating?: number;
};

const emptyForm = {
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  isAvailable: true,
};

export default function OwnerPoiDetailClient({ poiId }: { poiId: string }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [poiName, setPoiName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuRes, reviewRes, poiRes] = await Promise.all([
        api.get(`/menu-items/owner/list?poiId=${poiId}&page=1&limit=100`),
        api.get(`/pois/${poiId}/reviews`),
        getPoi(poiId),
      ]);

      const menuPayload = menuRes.data ?? [];
      const menuList = Array.isArray(menuPayload)
        ? menuPayload
        : Array.isArray((menuPayload as any).data)
        ? (menuPayload as any).data
        : [];
      setMenuItems(menuList);

      const reviewData = reviewRes as ReviewApiResponse;
      if (reviewData.success && Array.isArray(reviewData.data)) {
        setReviews(reviewData.data);
        setAvgRating(reviewData.averageRating ?? 0);
      } else {
        setReviews([]);
        setAvgRating(0);
      }

      // POI details (name/title)
      if (poiRes && poiRes.success && poiRes.data) {
        // poiRes.data may be the POI object directly or wrapped
        const poiObj: any = poiRes.data;
        const name = poiObj.title || poiObj.name || poiObj.translations?.[0]?.name || '';
        setPoiName(name);
      } else {
        setPoiName('');
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
      setMenuItems([]);
      setReviews([]);
      setAvgRating(0);
    } finally {
      setLoading(false);
    }
  }, [poiId]);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    void fetchData();
  }, [loadData]);

  const reviewSummary = useMemo(() => {
    if (reviews.length === 0) return 'Chưa có đánh giá.';
    return `${avgRating.toFixed(1)} sao từ ${reviews.length} đánh giá`;
  }, [avgRating, reviews.length]);

  const openAddModal = () => {
    setFormMode('add');
    setSelectedItem(null);
    setFormData(emptyForm);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setFormMode('edit');
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      imageUrl: (item as any).imageUrl || '',
      isAvailable: item.isAvailable ?? true,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData(emptyForm);
    setErrorMessage('');
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('Vui lòng nhập tên món ăn.');
      return;
    }

    const priceValue = Number(formData.price);
    if (!formData.price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      setErrorMessage('Vui lòng nhập giá hợp lệ.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        price: priceValue,
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        isAvailable: formData.isAvailable,
      };

      if (formMode === 'add') {
        await api.post(`/pois/${poiId}/menu-items`, payload);
      } else if (selectedItem) {
        await api.put(`/menu-items/${selectedItem.id}`, payload);
      }

      closeModal();
      await loadData();
    } catch (error) {
      console.error('Lỗi khi lưu món ăn:', error);
      setErrorMessage('Không thể lưu món ăn. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm('Bạn có chắc muốn xóa món này không?')) return;
    try {
      await api.delete(`/menu-items/${item.id}`);
      await loadData();
    } catch (error) {
      console.error('Lỗi khi xóa món:', error);
      alert('Xóa món thất bại.');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await api.put(`/menu-items/${item.id}`, {
        isAvailable: !(item.isAvailable ?? true),
      });
      await loadData();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Cập nhật trạng thái không thành công.');
    }
  };

  if (loading) {
    return <div className="p-14 text-center text-slate-500">Đang tải dữ liệu cửa hàng...</div>;
  }

  return (
    <section className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="rounded-[2rem] border border-slate-200 bg-slate-50/90 p-8 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">Quản lý Cửa hàng</span>
              {poiName && (
                <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-900 border border-slate-200">
                  {poiName}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Thay đổi thực đơn và theo dõi phản hồi</h1>
            <p className="max-w-3xl text-sm text-slate-600">Cập nhật menu, quản lý trạng thái món ăn và xem đánh giá khách du lịch ngay trên trang này.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/30 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Thêm món mới
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {reviewSummary}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'menu'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Thực đơn món ăn ({menuItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'reviews'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đánh giá khách hàng ({reviews.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'menu' ? (
            <>
              {menuItems.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  <p className="text-lg font-semibold">Chưa có món nào trong thực đơn.</p>
                  <p className="mt-2 text-sm">Hãy thêm món mới để khách hàng có thể đặt.</p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {menuItems.map((item) => (
                    <div key={item.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.isAvailable ? 'Đang phục vụ' : 'Tạm ẩn'}
                          </span>
                          <h2 className="mt-4 text-xl font-bold text-slate-900">{item.name}</h2>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description || 'Món ăn chưa có mô tả. Hãy cập nhật chi tiết.'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">{item.price.toLocaleString()} đ</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-400">Giá</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Edit2 className="h-4 w-4" /> Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" /> Xóa
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAvailability(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          <Repeat className="h-4 w-4" />
                          {item.isAvailable ? 'Ẩn món' : 'Mở lại'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-5">
              {reviews.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  <p className="text-lg font-semibold">Chưa có đánh giá nào.</p>
                  <p className="mt-2 text-sm">Khách du lịch chưa gửi phản hồi cho cửa hàng này.</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Khách du lịch ẩn danh</p>
                          <p className="mt-1 text-xs text-slate-500">Đánh giá mới nhất</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                          <Star className="h-4 w-4" /> {review.rating}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">{review.comment || 'Khách hàng chỉ để lại đánh giá sao, chưa có bình luận.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={formMode === 'add' ? 'Thêm món mới' : 'Chỉnh sửa món'}
        size="md"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Tên món ăn
              <input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Ví dụ: Bánh mì đặc biệt"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Giá bán (VNĐ)
              <input
                value={formData.price}
                onChange={(event) => setFormData({ ...formData, price: event.target.value.replace(/[^0-9]/g, '') })}
                placeholder="Ví dụ: 85000"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            Mô tả món ăn
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows={4}
              placeholder="Mô tả ngắn về món ăn"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            URL ảnh món ăn
            <input
              value={formData.imageUrl}
              onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
              placeholder="Ví dụ: https://example.com/image.jpg"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(event) => setFormData({ ...formData, isAvailable: event.target.checked })}
              className="h-4 w-4 rounded border border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Cho phép phục vụ món này
          </label>

          {errorMessage && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Mẹo tạo món ăn hấp dẫn</p>
            <p>Ghi rõ các thành phần chính và phong cách phục vụ để khách du lịch dễ chọn. Ví dụ: giòn, cay, chay, đặc sản địa phương.</p>
          </div>
        </div>
      </Modal>
    </section>
  );
}
