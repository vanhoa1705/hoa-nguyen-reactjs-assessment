import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { useBreeds } from './useBreeds'
import { createTestQueryClient } from '../test/utils'

vi.mock('../api/dogApi', () => ({
  fetchBreedsPage: vi.fn(),
}))

import { fetchBreedsPage } from '../api/dogApi'

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, { client: createTestQueryClient() }, children)
}

describe('useBreeds', () => {
  it('merges two pages and deduplicates by id', async () => {
    const page0 = [
      {
        id: 1,
        name: 'Breed A',
        life_span: '10',
        weight: { imperial: '10', metric: '5' },
        height: { imperial: '10', metric: '25' },
      },
      {
        id: 2,
        name: 'Breed B',
        life_span: '10',
        weight: { imperial: '10', metric: '5' },
        height: { imperial: '10', metric: '25' },
      },
    ]
    const page1 = [
      {
        id: 2,
        name: 'Breed B',
        life_span: '10',
        weight: { imperial: '10', metric: '5' },
        height: { imperial: '10', metric: '25' },
      },
      {
        id: 3,
        name: 'Breed C',
        life_span: '10',
        weight: { imperial: '10', metric: '5' },
        height: { imperial: '10', metric: '25' },
      },
    ]
    vi.mocked(fetchBreedsPage).mockImplementation((page) =>
      Promise.resolve(page === 0 ? page0 : page1),
    )

    const { result } = renderHook(() => useBreeds(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.map((b) => b.id)).toEqual([1, 2, 3])
  })

  it('returns only page0 when page1 is empty', async () => {
    const page0 = [
      {
        id: 1,
        name: 'A',
        life_span: '10',
        weight: { imperial: '10', metric: '5' },
        height: { imperial: '10', metric: '25' },
      },
    ]
    vi.mocked(fetchBreedsPage).mockImplementation((page) =>
      Promise.resolve(page === 0 ? page0 : []),
    )

    const { result } = renderHook(() => useBreeds(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
  })

  it('exposes error when fetch fails', async () => {
    vi.mocked(fetchBreedsPage).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useBreeds(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('network error')
  })
})
