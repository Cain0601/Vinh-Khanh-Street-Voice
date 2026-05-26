"use client"

import Link from 'next/link'

export default function CustomerHeader() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-lg font-semibold">Customer</div>
      <nav className="flex gap-3">
        <Link href="/">Home</Link>
        <Link href="/pois">Places</Link>
        <Link href="/(customer)/bookmarks">Bookmarks</Link>
      </nav>
    </div>
  )
}
