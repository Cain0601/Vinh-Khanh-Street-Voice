import { create } from 'zustand'

type User = {
  id: string
  displayName?: string
  fullName?: string
  email?: string
  role?: string
  language?: string
  isOnboarded?: boolean
  phoneNumber?: string | null
  avatar?: string | null
  brandName?: string | null
}

type UserState = {
  user: User | null
  token?: string | null
  language?: string
  locationEnabled?: boolean
  setLocationPermission: (enabled: boolean) => void
  setUser: (u: User | null) => void
  setToken: (t?: string | null) => void
  setLanguage: (language: string) => void
  updateUser: (patch: Partial<User>) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  locationEnabled: false,
  setLocationPermission: (enabled) => set({ locationEnabled: enabled }),
  language: 'vi',
  setUser: (u) => set((state) => ({
    user: u ? { ...state.user, ...u } : null,
    language: u?.language ?? state.language,
  })),
  setToken: (t) => set({ token: t }),
  setLanguage: (language) => set({ language }),
  updateUser: (patch) => set((state) => ({
    user: state.user ? { ...state.user, ...patch } : state.user,
    language: patch.language ?? state.language,
  })),
  logout: () => set({ user: null, token: null, locationEnabled: false })
}));
