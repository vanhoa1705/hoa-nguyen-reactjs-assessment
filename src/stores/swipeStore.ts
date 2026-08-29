import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Breed } from '../types/breed'

interface SwipeState {
  currentBreedId: string | null
  isDone: boolean
  advance: (breeds: Breed[], hasNextPage?: boolean) => void
}

export const useSwipeStore = create<SwipeState>()(
  persist(
    (set, get) => ({
      currentBreedId: null,
      isDone: false,

      advance: (breeds, hasNextPage = false) => {
        const { currentBreedId } = get()
        const currentIdx =
          currentBreedId === null ? 0 : breeds.findIndex((b) => String(b.id) === currentBreedId)
        if (currentIdx === -1) return
        const next = breeds[currentIdx + 1]
        if (next) {
          set({ currentBreedId: String(next.id) })
        } else if (!hasNextPage) {
          set({ isDone: true })
        }
        // hasNextPage=true: more pages loading — sync effect advances when they arrive
      },
    }),
    { name: 'dogfinder-swipe' },
  ),
)
