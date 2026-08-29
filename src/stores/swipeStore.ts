import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Breed } from '../types/breed'

interface SwipeState {
  currentBreedId: string | null
  advance: (breeds: Breed[]) => void
  reset: () => void
}

export const useSwipeStore = create<SwipeState>()(
  persist(
    (set, get) => ({
      currentBreedId: null,

      advance: (breeds) => {
        const { currentBreedId } = get()
        const idx = breeds.findIndex((b) => String(b.id) === currentBreedId)
        const next = breeds[idx + 1]
        set({ currentBreedId: next ? String(next.id) : null })
      },

      reset: () => set({ currentBreedId: null }),
    }),
    { name: 'dogfinder-swipe' },
  ),
)
