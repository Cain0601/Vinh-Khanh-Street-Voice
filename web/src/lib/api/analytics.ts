import { api } from "@/lib/api";

export type QrStats = {
  totalScans: number;
  bySource: { source: string; count: number }[];
  byPoi: { poiId: string; poiName: string; count: number }[];
};

export const analyticsApi = {
  getQrStats: async (): Promise<QrStats> => {
    const res = await api.get("/analytics/qr-stats");
    return res.data as QrStats;
  },
};

export default analyticsApi;
