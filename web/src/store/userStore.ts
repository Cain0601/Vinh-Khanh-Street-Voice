import { create } from 'zustand'

type User = {
  id: string
  displayName?: string
  email?: string
  role?: string
}

type UserState = {
  user: User | null
  token?: string | null
  setUser: (u: User | null) => void
  setToken: (t?: string | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  setUser: (u) => set({ user: u }),
  setToken: (t) => set({ token: t }),
  logout: () => set({ user: null, token: null })
}));
