'use client'

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-spin" />
        <div className="absolute inset-1 bg-slate-900 rounded-full" />
      </div>
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  )
}
