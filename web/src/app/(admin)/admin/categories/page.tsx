"use client"

import { useEffect, useState } from 'react'
import { getAdminCategories } from '@/lib/adminApi'
import { createCategory, updateCategory, deleteCategory } from '@/lib/adminApi'
import { cn } from '@/lib/cn'
import { FolderTree, Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react'

type Category = {
  id: string
  name: Record<string, string>
  slug: string
  icon?: string
  color?: string
  description?: Record<string, string>
  order: number
  active: boolean
}

const emptyForm = (): Partial<Category> => ({
  name: { vi: '', en: '' },
  slug: '',
  icon: '📍',
  color: '#10b981',
  description: { vi: '', en: '' },
  order: 0,
  active: true,
})

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Category>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const res = await getAdminCategories()
    if (res.success) {
      const data = Array.isArray(res.data) ? (res.data as Category[]) : []
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setCategories(data)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditId(cat.id)
    setForm({ ...cat })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.slug || !form.name?.vi) return
    setSaving(true)
    if (editId) {
      await updateCategory(editId, form)
    } else {
      await createCategory(form)
    }
    setSaving(false)
    setShowForm(false)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return
    await deleteCategory(id)
    await load()
  }

  async function handleDrop(e: React.DragEvent, dropIdx: number) {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === dropIdx) return

    const newCats = [...categories]
    const draggedItem = newCats[draggedIdx]
    
    // Remove from old pos and insert to new pos
    newCats.splice(draggedIdx, 1)
    newCats.splice(dropIdx, 0, draggedItem)

    // Reassign order
    newCats.forEach((c, idx) => {
      c.order = idx
    })

    setCategories(newCats)
    setDraggedIdx(null)

    // Optimistically update backend
    const updates = newCats.map(c => updateCategory(c.id, { order: c.order }))
    await Promise.all(updates)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý danh mục</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} danh mục đang hoạt động</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => setDraggedIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, idx)}
              className={cn(
                "group relative rounded-2xl bg-secondary/50 border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all duration-300 cursor-grab active:cursor-grabbing",
                draggedIdx === idx && "opacity-50 border-emerald-500/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mr-1">
                    <GripVertical size={18} />
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ background: `${cat.color || '#10b981'}15`, boxShadow: `0 4px 14px ${cat.color || '#10b981'}10` }}
                  >
                    {cat.icon || '📍'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{cat.name?.vi || cat.slug}</h3>
                    {cat.name?.en && (
                      <p className="text-xs text-muted-foreground">{cat.name.en}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {cat.description?.vi && (
                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{cat.description.vi}</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
                <span className="text-[10px] text-muted-foreground font-mono">/{cat.slug}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">#{cat.order}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      cat.active !== false ? 'bg-emerald-400' : 'bg-red-400'
                    )} />
                    <span className="text-[10px] text-muted-foreground">
                      {cat.active !== false ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={openCreate}
            className="rounded-2xl border-2 border-dashed border-white/[0.08] p-5 flex flex-col items-center justify-center gap-2 min-h-[140px] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
              <Plus size={20} className="text-muted-foreground group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-emerald-400 transition-colors">Thêm danh mục mới</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-[#131b2e] border border-white/[0.08] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-foreground">
                {editId ? 'Sửa danh mục' : 'Thêm danh mục'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Icon + Color */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-muted-foreground mb-1.5">Icon (emoji)</label>
                  <input
                    value={form.icon || ''}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="📍"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-muted-foreground mb-1.5">Màu</label>
                  <input
                    type="color"
                    value={form.color || '#10b981'}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-full h-[42px] rounded-xl border border-white/[0.06] cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Name VI */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Tên (Tiếng Việt) *</label>
                <input
                  value={form.name?.vi || ''}
                  onChange={e => setForm(f => ({ ...f, name: { ...f.name!, vi: e.target.value } }))}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="Quán Cơm"
                />
              </div>

              {/* Name EN */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Tên (English)</label>
                <input
                  value={form.name?.en || ''}
                  onChange={e => setForm(f => ({ ...f, name: { ...f.name!, en: e.target.value } }))}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="Rice Restaurant"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Slug *</label>
                <input
                  value={form.slug || ''}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="quan-com"
                />
              </div>

              {/* Description VI */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Mô tả (Tiếng Việt)</label>
                <textarea
                  value={form.description?.vi || ''}
                  onChange={e => setForm(f => ({ ...f, description: { ...f.description!, vi: e.target.value } }))}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Thứ tự</label>
                <input
                  type="number"
                  value={form.order || 0}
                  onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                  className="w-24 px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
              </div>

              {/* Active Toggle */}
              <div className="col-span-1 flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Hoạt động</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Hiển thị danh mục này cho người dùng</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors duration-200',
                    form.active ? 'bg-emerald-500' : 'bg-white/10'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                    form.active && 'translate-x-5'
                  )} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.slug || !form.name?.vi}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Check size={16} />
                {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
