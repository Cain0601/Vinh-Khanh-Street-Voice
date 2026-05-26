"use client"

import Link from 'next/link'

export default function AdminHeader() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-lg font-semibold">Admin</div>
      <nav className="flex gap-3">
        <Link href="/(admin)/dashboard">Dashboard</Link>
        <Link href="/(admin)/users">Users</Link>
      </nav>
    </div>
  )
}
