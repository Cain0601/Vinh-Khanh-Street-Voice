import { api } from "@/lib/api";

export type ProfileUpdate = {
  displayName?: string;
  fullName?: string;
  email?: string;
  language?: string;
};

export type PasswordUpdate = {
  newPassword: string;
};

export const authApi = {
  me: () => api.get("/auth/me"),
  updateProfile: (profile: ProfileUpdate) => api.put("/auth/profile", profile),
  changePassword: (payload: PasswordUpdate) => api.put("/auth/password", payload),
};
