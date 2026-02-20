import { create } from 'zustand'

interface FavoritesState {
  favoriteIds: Set<string>
  loaded: boolean
  setFavorites: (ids: string[]) => void
  addFavorite: (workerId: string) => void
  removeFavorite: (workerId: string) => void
  isFavorited: (workerId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<string>(),
  loaded: false,
  setFavorites: (ids) => set({ favoriteIds: new Set(ids), loaded: true }),
  addFavorite: (workerId) =>
    set((state) => {
      const next = new Set(state.favoriteIds)
      next.add(workerId)
      return { favoriteIds: next }
    }),
  removeFavorite: (workerId) =>
    set((state) => {
      const next = new Set(state.favoriteIds)
      next.delete(workerId)
      return { favoriteIds: next }
    }),
  isFavorited: (workerId) => get().favoriteIds.has(workerId),
}))
