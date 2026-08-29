import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { useVoteActions } from './useVoteActions'
import { useSwipeStore } from '../stores/swipeStore'
import { createTestQueryClient } from '../test/utils'
import type { Breed } from '../types/breed'

vi.mock('../api/dogApi', () => ({
  postVote: vi.fn(),
}))

import { postVote } from '../api/dogApi'

const makeBreed = (id: number, imageId?: string): Breed => ({
  id,
  name: `Breed ${id}`,
  life_span: '10 years',
  weight: { imperial: '10', metric: '5' },
  height: { imperial: '10', metric: '25' },
  reference_image_id: imageId,
})

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, { client: createTestQueryClient() }, children)
}

beforeEach(() => {
  useSwipeStore.setState({ currentBreedId: null, isDone: false })
  vi.mocked(postVote).mockResolvedValue({ id: 1, message: 'SUCCESS' })
})

describe('useVoteActions', () => {
  it('calls postVote with breed image id and value', async () => {
    const breeds = [makeBreed(1, 'img-1'), makeBreed(2, 'img-2')]
    const { result } = renderHook(() => useVoteActions(breeds), { wrapper })

    await act(async () => {
      result.current.vote(breeds[0], 1)
    })

    await waitFor(() =>
      expect(postVote).toHaveBeenCalledWith({ imageId: 'img-1', value: 1 }, expect.any(Object)),
    )
  })

  it('advances store after successful vote', async () => {
    const breeds = [makeBreed(1, 'img-1'), makeBreed(2, 'img-2')]
    const { result } = renderHook(() => useVoteActions(breeds), { wrapper })

    await act(async () => {
      result.current.vote(breeds[0], 1)
    })

    await waitFor(() => expect(useSwipeStore.getState().currentBreedId).toBe('2'))
  })

  it('skips API call and still advances when breed has no image', async () => {
    const breeds = [makeBreed(1, undefined), makeBreed(2, 'img-2')]
    const { result } = renderHook(() => useVoteActions(breeds), { wrapper })

    await act(async () => {
      result.current.vote(breeds[0], 1)
    })

    expect(postVote).not.toHaveBeenCalled()
    expect(useSwipeStore.getState().currentBreedId).toBe('2')
  })
})
