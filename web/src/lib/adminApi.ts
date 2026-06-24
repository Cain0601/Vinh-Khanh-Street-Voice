import api from "./api";

// ─── Admin Users ───
export async function getAdminUsers(page = 1, pageSize = 20) {
  return api.get<any>(`/admin/users?page=${page}&pageSize=${pageSize}`);
}

export async function getAdminUser(id: string) {
  return api.get<any>(`/admin/users/${id}`);
}

export async function changeUserRole(id: string, role: string) {
  return api.put<any>(`/admin/users/${id}/role`, { role });
}

export async function changeUserStatus(id: string, isActive: boolean) {
  return api.put<any>(`/admin/users/${id}/status`, { isActive });
}

export async function deleteUser(id: string) {
  return api.del<any>(`/admin/users/${id}`);
}

// ─── Moderation ───
export async function getModerationRequests(status?: string) {
  const params = status ? `?status=${status}` : "";
  return api.get<any>(`/admin/moderation/requests${params}`);
}

export async function getModerationRequest(id: string) {
  return api.get<any>(`/admin/moderation/requests/${id}`);
}

export async function approveModerationRequest(id: string) {
  return api.post<any>(`/admin/moderation/requests/${id}/approve`);
}

export async function rejectModerationRequest(id: string, reason?: string) {
  return api.post<any>(`/admin/moderation/requests/${id}/reject`, { reason });
}

// ─── Admin Categories ───
export async function getAdminCategories() {
  return api.get<any>("/admin/categories");
}

export async function createCategory(data: any) {
  return api.post<any>("/admin/categories", data);
}

export async function updateCategory(id: string, data: any) {
  return api.put<any>(`/admin/categories/${id}`, data);
}

export async function deleteCategory(id: string) {
  return api.del<any>(`/admin/categories/${id}`);
}

// ─── Audit Logs ───
export async function getAuditLogs(page = 1, pageSize = 20) {
  return api.get<any>(`/admin/audit-logs?page=${page}&pageSize=${pageSize}`);
}

// ─── Admin Analytics ───
export async function getAnalyticsSummary() {
  return api.get<any>("/admin/analytics/summary");
}

export async function getTopPois() {
  return api.get<any>("/admin/analytics/top-pois");
}

export async function getHeatmapData() {
  return api.get<any>("/admin/analytics/heatmap");
}

// ─── Admin POIs ───
export async function getAdminPois() {
  return api.get<any>("/admin/pois");
}

export async function getAdminPoi(id: string) {
  return api.get<any>(`/admin/pois/${id}`);
}

export async function createAdminPoi(data: any) {
  return api.post<any>("/admin/pois", data);
}

export async function updateAdminPoi(id: string, data: any) {
  return api.put<any>(`/admin/pois/${id}`, data);
}

export async function updatePoiStatus(id: string, status: string) {
  return api.put<any>(`/admin/pois/${id}/status`, { status });
}

export async function deleteAdminPoi(id: string) {
  return api.del<any>(`/admin/pois/${id}`);
}

// ─── System Settings ───
export async function getSystemSettings() {
  return api.get<any>("/admin/settings");
}

export async function updateSystemSettings(data: any) {
  return api.put<any>("/admin/settings", data);
}
