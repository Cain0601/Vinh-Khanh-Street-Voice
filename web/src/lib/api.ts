import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5190'

type ApiResponse<T> = {
  success: boolean
  message?: string | null
  data?: T | null
}

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true
})

// Attach token from cookie (supports ft_token or token)
instance.interceptors.request.use((config) => {
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const ft = cookies.find(c => c.startsWith('ft_token='))
      const t = cookies.find(c => c.startsWith('token='))
      const token = ft ? decodeURIComponent(ft.split('=')[1]) : t ? decodeURIComponent(t.split('=')[1]) : undefined
      if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

async function wrap<T = any>(p: Promise<any>): Promise<ApiResponse<T>> {
  try {
    const res = await p
    const payload = res?.data
    if (payload && typeof payload === 'object' && ('success' in payload || 'data' in payload)) {
      return {
        success: !!payload.success,
        message: payload.message ?? null,
        data: payload.data ?? null
      }
    }
    return { success: true, message: null, data: payload }
  } catch (err: any) {
    const message = err?.response?.data?.message ?? err?.message ?? 'Unknown error'
    const data = err?.response?.data ?? null
    return { success: false, message, data }
  }
}

export async function getCategories() {
  return wrap<any[]>(instance.get('/api/categories'))
}

export async function getPois() {
  return wrap<any[]>(instance.get('/api/pois'))
}

export async function getPoi(id: string) {
  return wrap<any>(instance.get(`/api/pois/${id}`))
}

export async function getBookmarks() {
  return wrap<any[]>(instance.get('/api/bookmarks'))
}

export async function toggleBookmark(poiId: string) {
  return wrap(instance.post('/api/bookmarks', { poiId }))
}

export default {
  instance,
  get: <T = any>(url: string, config?: AxiosRequestConfig) => wrap<T>(instance.get(url, config)),
  post: <T = any>(url: string, body?: any, config?: AxiosRequestConfig) => wrap<T>(instance.post(url, body, config)),
  put: <T = any>(url: string, body?: any, config?: AxiosRequestConfig) => wrap<T>(instance.put(url, body, config)),
  del: <T = any>(url: string, config?: AxiosRequestConfig) => wrap<T>(instance.delete(url, config)),
}
