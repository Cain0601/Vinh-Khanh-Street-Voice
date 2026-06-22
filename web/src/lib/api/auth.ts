import { api } from "@/lib/api";

export type AuthUserProfile = {
  id: string;
  email?: string;
  displayName?: string;
  fullName?: string;
  role?: string;
  language?: string;
  isOnboarded?: boolean;
};

export type ProfileUpdate = {
  displayName?: string;
  fullName?: string;
  email?: string;
  language?: string;
  isOnboarded?: boolean;
};

export type PasswordUpdate = {
  newPassword: string;
};

export type RegisterPayload = {
  displayName: string;
  email: string;
  password: string;
  language?: string;
};

export const authApi = {
  me: () => api.get<AuthUserProfile>("/auth/me"),
  register: (payload: RegisterPayload) => api.post<AuthUserProfile>("/auth/register", payload),
  updateProfile: (profile: ProfileUpdate) => api.put<AuthUserProfile>("/auth/profile", profile),
  changePassword: (payload: PasswordUpdate) => api.put("/auth/password", payload),
};
