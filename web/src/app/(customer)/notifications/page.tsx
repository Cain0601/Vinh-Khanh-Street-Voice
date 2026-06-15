'use client'

import Header from '@/components/Layout/Header'
import EmptyState from '@/components/Common/EmptyState'
import router from 'next/dist/shared/lib/router/router'
import { useRouter } from 'next/dist/client/components/navigation'

export default function NotificationsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header title="Thông báo" showBack onBack={() => router.push("/home")} />
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
