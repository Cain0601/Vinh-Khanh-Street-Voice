"use client"

import { useTranslation } from '@/i18n'

export default function CustomerSidebar() {
  const t = useTranslation();

  return (
    <aside className="w-56 space-y-2">
      <div className="font-semibold">{t.customer.sidebar.explore}</div>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        <li>{t.customer.sidebar.nearby}</li>
        <li>{t.customer.sidebar.categories}</li>
        <li>{t.customer.sidebar.topRated}</li>
      </ul>
    </aside>
  )
}
