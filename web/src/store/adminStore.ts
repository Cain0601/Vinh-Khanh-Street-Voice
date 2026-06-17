import { create } from "zustand";

type AdminState = {
  // Users
  users: any[];
  usersTotal: number;
  usersPage: number;
  usersLoading: boolean;
  selectedUser: any | null;

  // Moderation
  moderationRequests: any[];
  moderationLoading: boolean;

  // Audit
  auditLogs: any[];
  auditTotal: number;
  auditPage: number;
  auditLoading: boolean;

  // Analytics
  summary: any | null;
  topPois: any[];
  analyticsLoading: boolean;

  // Actions
  setUsers: (users: any[], total: number, page: number) => void;
  setUsersLoading: (v: boolean) => void;
  setSelectedUser: (u: any | null) => void;

  setModerationRequests: (items: any[]) => void;
  setModerationLoading: (v: boolean) => void;

  setAuditLogs: (logs: any[], total: number, page: number) => void;
  setAuditLoading: (v: boolean) => void;

  setSummary: (s: any) => void;
  setTopPois: (p: any[]) => void;
  setAnalyticsLoading: (v: boolean) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersLoading: false,
  selectedUser: null,

  moderationRequests: [],
  moderationLoading: false,

  auditLogs: [],
  auditTotal: 0,
  auditPage: 1,
  auditLoading: false,

  summary: null,
  topPois: [],
  analyticsLoading: false,

  setUsers: (users, total, page) => set({ users, usersTotal: total, usersPage: page }),
  setUsersLoading: (v) => set({ usersLoading: v }),
  setSelectedUser: (u) => set({ selectedUser: u }),

  setModerationRequests: (items) => set({ moderationRequests: items }),
  setModerationLoading: (v) => set({ moderationLoading: v }),

  setAuditLogs: (logs, total, page) => set({ auditLogs: logs, auditTotal: total, auditPage: page }),
  setAuditLoading: (v) => set({ auditLoading: v }),

  setSummary: (s) => set({ summary: s }),
  setTopPois: (p) => set({ topPois: p }),
  setAnalyticsLoading: (v) => set({ analyticsLoading: v }),
}));
