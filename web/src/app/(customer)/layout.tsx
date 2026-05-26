'use client'

import MobileContainer from '@/components/Layout/MobileContainer'
import BottomNav from '@/components/Layout/BottomNav'
import SafeArea from '@/components/Layout/SafeArea'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileContainer>
      <SafeArea className=" overflow-y-auto">
        {children}
      </SafeArea>
      <BottomNav />
    </MobileContainer>
  )
}
