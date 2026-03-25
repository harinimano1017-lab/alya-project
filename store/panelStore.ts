import { create } from 'zustand'

export type PanelId = 'lip' | 'image' | 'text' | 'sign'

type PanelStore = {
  minimized: Set<PanelId>
  togglePanel: (id: PanelId) => void
  restoreAll: () => void
  isMinimized: (id: PanelId) => boolean
  visibleCount: () => number
}

export const usePanelStore = create<PanelStore>((set, get) => ({
  minimized: new Set(),

  togglePanel: (id) =>
    set((state) => {
      const next = new Set(state.minimized)
      next.has(id) ? next.delete(id) : next.add(id)
      return { minimized: next }
    }),

  restoreAll: () => set({ minimized: new Set() }),

  isMinimized: (id) => get().minimized.has(id),

  visibleCount: () => 4 - get().minimized.size,
}))