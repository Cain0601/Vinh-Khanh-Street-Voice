 'use client'

import Link from 'next/link'
import { Map } from 'lucide-react'

export default function MapPreviewCard() {
  return (
    <Link href="/map" className="block w-full group">
      <div className="rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-emerald-500 transition-all">
        {/* Map Preview Image/Placeholder */}
        <div className="relative h-40 md:h-64 bg-slate-700 flex items-center justify-center overflow-hidden">
          <Map className="h-20 w-20 md:h-28 md:w-28 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent group-hover:from-emerald-500/10 group-hover:via-emerald-500/20 group-hover:to-emerald-500/10 transition-all" />
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">
            Xem bản đồ địa điểm thực tương tác
          </h3>
          <p className="text-xs md:text-sm text-slate-400 mb-3">
            Khám phá các quán ăn trên bản đồ Vĩnh Khánh
          </p>
          <div className="flex items-center gap-2 text-emerald-500 group-hover:gap-3 transition-all">
            <span className="text-sm font-medium">Mở bản đồ</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
