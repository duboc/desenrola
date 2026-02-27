import { create } from 'zustand'

interface AppState {
  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Quick Add modal
  quickAddOpen: boolean
  openQuickAdd: () => void
  closeQuickAdd: () => void

  // Onboarding
  onboardingCompleted: boolean
  setOnboardingCompleted: (completed: boolean) => void

  // Active page for highlights
  activePage: string
  setActivePage: (page: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  theme: 'system',
  setTheme: (theme) => {
    set({ theme })
    // Apply to document
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
  },

  quickAddOpen: false,
  openQuickAdd: () => set({ quickAddOpen: true }),
  closeQuickAdd: () => set({ quickAddOpen: false }),

  onboardingCompleted: false,
  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),
}))
