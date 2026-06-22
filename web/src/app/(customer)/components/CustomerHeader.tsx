"use client"

import Link from 'next/link'
import { useTranslation } from '@/i18n'

export default function CustomerHeader() {
  const t = useTranslation();

  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-lg font-semibold">{t.customer.header.title}</div>
      <nav className="flex gap-3">
        <Link href="/">{t.customer.header.home}</Link>
        <Link href="/pois">{t.customer.header.places}</Link>
        <Link href="/(customer)/bookmarks">{t.customer.header.bookmarks}</Link>
      </nav>
    </div>
  )
}
