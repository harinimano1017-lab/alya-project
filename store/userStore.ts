import { create } from 'zustand'

type ChildProfile = {
  id: string
  name: string
  avatarUrl: string | null
  preferredLang: string
}

type User = {
  id: string
  name: string
  email: string
  role: 'CHILD' | 'PARENT' | 'EDUCATOR' | 'ADMIN'
}

type UserStore = {
  user: User | null
  activeChild: ChildProfile | null
  language: 'EN' | 'TA'
  setUser: (user: User | null) => void
  setActiveChild: (child: ChildProfile | null) => void
  setLanguage: (lang: 'EN' | 'TA') => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  activeChild: null,
  language: 'EN',
  setUser: (user) => set({ user }),
  setActiveChild: (child) => set({ activeChild: child }),
  setLanguage: (language) => set({ language }),
}))