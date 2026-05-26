'use client'

import Header from '@/components/Layout/Header'
import EmptyState from '@/components/Common/EmptyState'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header title="Thông báo" showBack={true} />
      <div className="flex-1 flex items-center justify-center px-4">
        <EmptyState
          icon="🔔"
          title="Chưa có thông báo"
          description="Bạn sẽ nhận được thông báo khi có quán ăn mới hoặc khuyến mãi đặc biệt"
        />
      </div>
    </div>
  )
}
