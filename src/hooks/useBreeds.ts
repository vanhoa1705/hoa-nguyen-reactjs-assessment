import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchBreedsPage } from '../api/dogApi'
import { BREEDS_PAGE_LIMIT } from '../constants/api'
import type { Breed } from '../types/breed'

export function useBreeds(enabled = true, initialPage = 0) {
  const [pageState, setPageState] = useState({ initialPage, page: initialPage })

  const page = pageState.initialPage === initialPage ? pageState.page : initialPage

  useEffect(() => {
    if (pageState.initialPage !== initialPage) {
      setPageState({ initialPage, page: initialPage })
    }
  }, [initialPage, pageState.initialPage])

  const query = useQuery({
    queryKey: ['breeds', 'page', page] as const,
    queryFn: (): Promise<Breed[]> => fetchBreedsPage(page),
    staleTime: Infinity,
    enabled,
  })

  const breeds = useMemo(() => {
    const flat = query.data ?? []
    const seen = new Set<number>()
    return flat.filter((b) => (seen.has(b.id) ? false : seen.add(b.id) && true))
  }, [query.data])

  const fetchNextPage = useCallback(() => {
    setPageState({ initialPage, page: page + 1 })
  }, [initialPage, page])

  const hasNextPage = Boolean(query.isSuccess && query.data?.length === BREEDS_PAGE_LIMIT)

  return {
    data: breeds,
    page,
    isLoading: enabled && query.isPending,
    isError: query.isError,
    isSuccess: enabled && query.isSuccess,
    error: query.error ?? null,
    refetch: query.refetch,
    fetchNextPage,
    hasNextPage,
  }
}
