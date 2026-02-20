import { create } from 'zustand'

export type SortOption = 'relevance' | 'rating' | 'price_low' | 'price_high' | 'reviews'

interface SearchFilters {
  serviceId: string | null
  minRating: number
  maxDistance: number
  availableDay: number | null // 0-6 (Sun-Sat)
  locationLat: number | null
  locationLng: number | null
  radiusKm: number
  query: string
  minPrice: number | null
  maxPrice: number | null
  sortBy: SortOption
  verifiedOnly: boolean
}

interface SearchState {
  filters: SearchFilters
  isSearching: boolean
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
  setSearching: (searching: boolean) => void
}

const defaultFilters: SearchFilters = {
  serviceId: null,
  minRating: 0,
  maxDistance: 50,
  availableDay: null,
  locationLat: null,
  locationLng: null,
  radiusKm: 25,
  query: '',
  minPrice: null,
  maxPrice: null,
  sortBy: 'relevance',
  verifiedOnly: false,
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  isSearching: false,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSearching: (isSearching) => set({ isSearching }),
}))
