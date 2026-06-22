import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5190";

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data?: T | null;
};

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true,
});

// Attach token from cookie (supports ft_token or token)
instance.interceptors.request.use((config) => {
  try {
    // Owner middleware bypass for local testing
    // Backend supports: header `X-Dev-Bypass: owner`
    const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS;
    if (devBypass === "owner" && config.headers) {
      config.headers["X-Dev-Bypass"] = "owner";
    }

    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const ft = cookies.find((c) => c.startsWith("ft_token="));
      const t = cookies.find((c) => c.startsWith("token="));
      const token = ft
        ? decodeURIComponent(ft.split("=")[1])
        : t
          ? decodeURIComponent(t.split("=")[1])
          : undefined;
      if (token && config.headers)
        config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});


async function wrap<T = unknown>(
  p: Promise<AxiosResponse<unknown>>,
): Promise<ApiResponse<T>> {
  try {
    const res = await p;
    const payload = res?.data;
    if (
      payload &&
      typeof payload === "object" &&
      ("success" in payload || "data" in payload)
    ) {
      const response = payload as Partial<ApiResponse<T>>;
      return {
        success: !!response.success,
        message: response.message ?? null,
        data: response.data ?? null,
      };
    }
    return { success: true, message: null, data: payload as T };
  } catch (err: unknown) {
    const error = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const message =
      error.response?.data?.message ?? error.message ?? "Unknown error";
    return { success: false, message, data: null };
  }
}

export const api = {
  instance,
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    wrap<T>(instance.get(url, config)),
  post: <T = unknown>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ) => wrap<T>(instance.post(url, body, config)),
  put: <T = unknown>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ) => wrap<T>(instance.put(url, body, config)),
  patch: <T = unknown>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ) => wrap<T>(instance.patch(url, body, config)),
  del: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    wrap<T>(instance.delete(url, config)),
  // alias `delete` for code that uses `api.delete(...)`
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    wrap<T>(instance.delete(url, config)),
};

export async function getCategories() {
  return wrap<unknown[]>(instance.get("/api/categories"));
}

export async function getPois(lang?: string) {
  const query = lang ? `?lang=${lang}` : "";
  return wrap<unknown[]>(instance.get(`/api/pois${query}`));
}

export async function getPoi(id: string, lang?: string) {
  const query = lang ? `?lang=${lang}` : "";
  return wrap<unknown>(instance.get(`/api/pois/${id}${query}`));
}

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
  return wrap<{ data: unknown[]; pagination: unknown }>(
    instance.get(`/pois/owner/list${qs}`),
  );
}

export async function createPoi(body: {
  title: string;
  summary?: string;
  address?: string;
  ownerId?: string;
}) {
  return wrap<unknown>(instance.post("/api/pois", body));
}

export async function getBookmarks() {
  return wrap<unknown[]>(instance.get("/api/bookmarks"));
}

export async function toggleBookmark(poiId: string) {
  return wrap(instance.post("/api/bookmarks", { poiId }));
}

export default api;
