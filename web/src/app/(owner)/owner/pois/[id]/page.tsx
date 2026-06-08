'use client';
import React, { useEffect, useState } from 'react';

type Props = { params: { id: string } }

export default function OwnerPoiDetail({ params }: Props) {
  const poiId = params.id;
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi đồng thời cả 2 API Backend (Menu và Review) của quán này
    Promise.all([
      fetch(`http://localhost:5190/api/owner/pois/${poiId}/menu-items`).then(res => res.json()),
      fetch(`http://localhost:5190/api/owner/pois/${poiId}/reviews`).then(res => res.json())
    ])
    .then(([menuJson, reviewJson]) => {
      if (menuJson.success) setMenuItems(menuJson.data);
      if (reviewJson.success) {
        setReviews(reviewJson.data);
        setAvgRating(reviewJson.averageRating);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Lỗi kết nối API:", err);
      setLoading(false);
    });
  }, [poiId]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Đang tải dữ liệu cửa hàng...</div>;
  }

  return (
    <section className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header quán */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Cửa hàng #{poiId}</h1>
        <p className="mt-1 text-slate-600">Thay đổi thực đơn món ăn và theo dõi phản hồi từ khách du lịch.</p>
      </div>

      {/* Thanh chuyển đổi giữa Menu và Đánh giá */}
      <div className="flex gap-6 border-b mb-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 px-1 transition duration-200 ${activeTab === 'menu' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Thực đơn món ăn ({menuItems.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-1 transition duration-200 ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Đánh giá từ khách hàng (⭐ {avgRating} / 5)
        </button>
      </div>

      {/* Nội dung hiển thị theo Tab */}
      {activeTab === 'menu' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">Danh sách món trong thực đơn</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm">
              + Thêm món mới
            </button>
          </div>

          {menuItems.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border border-dashed rounded-xl text-gray-400 text-sm">
              Cửa hàng của bạn chưa có món ăn nào. Hãy thêm món đầu tiên!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item: any) => (
                <div key={item.id} className="border border-gray-100 p-4 rounded-xl flex justify-between items-center bg-white shadow-sm hover:shadow transition">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.description || "Chưa có mô tả món ăn"}</p>
                    <p className="text-emerald-600 font-bold text-sm mt-2">{item.price?.toLocaleString()} đ</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="text-xs text-gray-600 hover:text-blue-600 border border-gray-200 px-2.5 py-1.5 rounded-lg font-medium transition">Sửa</button>
                    <button className="text-xs text-red-600 hover:bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg font-medium transition">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4">Ý kiến đóng góp từ khách hàng</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border border-dashed rounded-xl text-gray-400 text-sm">
              Chưa có lượt đánh giá nào cho quán ăn này.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="border border-gray-50 p-4 rounded-xl bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-gray-800">Thành viên ẩn danh</span>
                    <span className="text-amber-500 text-sm font-bold">⭐ {rev.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{rev.comment || "Khách hàng chỉ để lại số sao, không viết bình luận."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}