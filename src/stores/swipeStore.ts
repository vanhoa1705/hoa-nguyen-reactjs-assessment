import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Breed } from '../types/breed'

interface SwipeState {
  currentBreedId: string | null
  isDone: boolean
  votes: Record<string, number>
  history: string[]
  advance: (breeds: Breed[]) => void
  recordVote: (breedId: string, value: number) => void
  undo: () => void
  reset: () => void
}

export const useSwipeStore = create<SwipeState>()(
  persist(
    (set, get) => ({
      currentBreedId: null,
      isDone: false,
      votes: {},
      history: [],

      advance: (breeds) => {
        const { currentBreedId } = get()
        const currentIdx = currentBreedId
          ? breeds.findIndex((b) => String(b.id) === currentBreedId)
          : 0
        const current = currentBreedId ?? (breeds[0] ? String(breeds[0].id) : null)
        const next = breeds[currentIdx + 1]
        set((state) => ({
          history: current ? [...state.history, current] : state.history,
          ...(next ? { currentBreedId: String(next.id) } : { isDone: true }),
        }))
      },

      recordVote: (breedId, value) => {
        set((state) => ({ votes: { ...state.votes, [breedId]: value } }))
      },

      undo: () => {
        const { history, votes } = get()
        if (!history.length) return
        const newHistory = [...history]
        const prevBreedId = newHistory.pop()!
        const newVotes = { ...votes }
        delete newVotes[prevBreedId]
        set({ history: newHistory, currentBreedId: prevBreedId, isDone: false, votes: newVotes })
      },

      reset: () => set({ currentBreedId: null, isDone: false, votes: {}, history: [] }),
    }),
    { name: 'dogfinder-swipe' },
  ),
)
