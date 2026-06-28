'use client'

const VISITOR_KEY = 'ft_visitor_id'

export function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return 'guest'

  try {
    const existing = window.localStorage.getItem(VISITOR_KEY)
    if (existing) return existing

    const id = `guest-${crypto.randomUUID()}`
    window.localStorage.setItem(VISITOR_KEY, id)
    return id
  } catch {
    return `guest-${Math.random().toString(36).slice(2, 10)}`
  }
}
