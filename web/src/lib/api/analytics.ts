import { api } from "@/lib/api";

export const analyticsApi = {
  trackListen: (poiId: string) => api.post("/analytics/listen", { poiId }),
  trackQrScan: (poiId: string) => api.post("/analytics/qr-scan", { poiId }),
  trackView: (poiId: string) => api.post("/analytics/view", { poiId }),
};
