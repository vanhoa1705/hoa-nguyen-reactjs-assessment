import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Breed } from '../types/breed'

interface SwipeState {
  currentBreedId: string | null
  isDone: boolean
  advance: (breeds: Breed[]) => void
}

export const useSwipeStore = create<SwipeState>()(
  persist(
    (set, get) => ({
      currentBreedId: null,
      isDone: false,

      advance: (breeds) => {
        const { currentBreedId } = get()
        const currentIdx =
          currentBreedId === null
            ? 0
            : breeds.findIndex((b) => String(b.id) === currentBreedId)
        if (currentIdx === -1) return // ID not in loaded pages yet — don't reset
        const next = breeds[currentIdx + 1]
        set(next ? { currentBreedId: String(next.id) } : { isDone: true })
      },
    }),
    { name: 'dogfinder-swipe' },
  ),
)
