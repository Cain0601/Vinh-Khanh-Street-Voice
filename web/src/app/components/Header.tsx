"use client"

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-slate-900">FoodTour</Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-slate-700 hover:text-slate-900">Home</Link>
          <Link href="/owner" className="text-slate-700 hover:text-slate-900">Owner</Link>
          <Link href="/admin" className="text-slate-700 hover:text-slate-900">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
