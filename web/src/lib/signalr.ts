"use client";

export const VISITOR_ID_KEY = "ft_visitor_id";
let memoryVisitorId = "";

export function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : "";
}

export function getAuthToken() {
  return getCookieValue("ft_token") || getCookieValue("token");
}

export function getVisitorId() {
  const createVisitorId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = createVisitorId();
      window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    return visitorId;
  } catch {
    try {
      let visitorId = window.sessionStorage.getItem(VISITOR_ID_KEY);
      if (!visitorId) {
        visitorId = createVisitorId();
        window.sessionStorage.setItem(VISITOR_ID_KEY, visitorId);
      }

      return visitorId;
    } catch {
      if (!memoryVisitorId) {
        memoryVisitorId = createVisitorId();
      }

      return memoryVisitorId;
    }
  }
}

export function getHubUrl(path = "/hubs/location", params?: Record<string, string>) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5190";

  const hubUrl = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) hubUrl.searchParams.set(key, value);
    });
  }

  return hubUrl.toString();
}
