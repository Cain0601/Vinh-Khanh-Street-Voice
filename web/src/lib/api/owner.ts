import api from "@/lib/api";

export type OwnerPoiListItem = {
  id: string;
  ownerId: string;
  title?: string;
  summary?: string;
  address?: string;
  status?: string;
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
  mediaUrls?: string[];
  categoryId?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function getOwnerPois(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.status) q.set("status", params.status);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));

  const qs = q.toString() ? `?${q.toString()}` : "";
  return api.get<{ data: OwnerPoiListItem[]; pagination: Pagination }>(`/pois/owner/list${qs}`);
}

export async function createPoi(body: {
  title: string;
  summary?: string;
  address?: string;
  categoryId?: string;
}) {
  return api.post("/api/pois", body);
}

export async function updatePoi(id: string, body: Partial<{ title: string; summary: string; address: string; categoryId: string }>) {
  return api.put(`/api/pois/${id}`, body);
}

export async function deletePoi(id: string) {
  return api.del(`/api/pois/${id}`);
}

export async function getOwnerMenuItems(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.limit != null) q.set("limit", String(params.limit));

  const qs = q.toString() ? `?${q.toString()}` : "";
  return api.get<any>(`/menu-items/owner/list${qs}`);
}

export async function createMenuItemForPoi(poiId: string, body: {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}) {
  return api.post(`/pois/${poiId}/menu-items`, body);
}

export async function updateMenuItem(
  id: string,
  body: {
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
  },
) {
  return api.put(`/menu-items/${id}`, body);
}


export async function deleteMenuItem(id: string) {
  return api.del(`/menu-items/${id}`);
}

// ── Owner profile & settings ──────────────────────────────────────────────

export type OwnerProfile = {
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  brandName?: string | null;
};

export type OwnerSettings = {
  notificationsEmail: boolean;
  poiDefaultIsActive: boolean;
};

export async function getOwnerProfile() {
  return api.get<{ success: boolean; data: OwnerProfile }>('/owner/profile');
}

export async function updateOwnerProfile(body: {
  fullName?: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  brandName?: string | null;
}) {
  return api.put<{ success: boolean; data: OwnerProfile; message?: string }>('/owner/profile', body);
}

export async function getOwnerSettings() {
  return api.get<{ success: boolean; data: OwnerSettings }>('/owner/settings');
}

export async function updateOwnerSettings(body: {
  notificationsEmail?: boolean;
  poiDefaultIsActive?: boolean;
}) {
  return api.put<{ success: boolean; data: OwnerSettings; message?: string }>('/owner/settings', body);
}

