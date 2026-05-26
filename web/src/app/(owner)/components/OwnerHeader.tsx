"use client"

import Link from 'next/link'

export default function OwnerHeader() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-lg font-semibold">Owner Portal</div>
      <nav className="flex gap-3">
        <Link href="/(owner)/pois">My POIs</Link>
        <Link href="/(owner)/settings">Settings</Link>
      </nav>
    </div>
  )
}
