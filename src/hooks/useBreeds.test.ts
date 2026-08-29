import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { useBreeds } from './useBreeds'
import { createTestQueryClient } from '../test/utils'
import { BREEDS_PAGE_LIMIT } from '../constants/api'

vi.mock('../api/dogApi', () => ({
  fetchBreedsPage: vi.fn(),
}))

import { fetchBreedsPage } from '../api/dogApi'

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, { client: createTestQueryClient() }, children)
}

const makeBreed = (id: number) => ({
  id,
  name: `Breed ${id}`,
  life_span: '10',
  weight: { imperial: '10', metric: '5' },
  height: { imperial: '10', metric: '25' },
})

describe('useBreeds', () => {
  it('loads page 0 on mount and preserves API order', async () => {
    const page0 = [makeBreed(2), makeBreed(1)]
    vi.mocked(fetchBreedsPage).mockResolvedValue(page0)

    const { result } = renderHook(() => useBreeds(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.map((b) => b.id)).toEqual([2, 1])
  })

  it('loads next page when fetchNextPage is called', async () => {
    const page0 = Array.from({ length: BREEDS_PAGE_LIMIT }, (_, i) => makeBreed(i + 1))
    const page1 = [makeBreed(51), makeBreed(52)]
    vi.mocked(fetchBreedsPage).mockImplementation((page) =>
      Promise.resolve(page === 0 ? page0 : page1),
    )

    const { result } = renderHook(() => useBreeds(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(true)

    await act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.data).toHaveLength(2))

    expect(result.current.data?.map((b) => b.id)).toEqual([51, 52])
  })

  it('loads only the requested initial page', async () => {
    vi.mocked(fetchBreedsPage).mockImplementation((page) =>
      Promise.resolve([makeBreed(page * BREEDS_PAGE_LIMIT + 1)]),
    )

    const { result } = renderHook(() => useBreeds(true, 2), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetchBreedsPage).toHaveBeenCalledTimes(1)
    expect(fetchBreedsPage).toHaveBeenCalledWith(2)
    expect(result.current.data?.map((b) => b.id)).toEqual([41])
  })

  it('hasNextPage is false when last page has fewer than limit items', async () => {
    vi.mocked(fetchBreedsPage).mockResolvedValue([makeBreed(1)])

    const { result } = renderHook(() => useBreeds(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(false)
  })

  it('exposes error when fetch fails', async () => {
    vi.mocked(fetchBreedsPage).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useBreeds(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('network error')
  })
})
