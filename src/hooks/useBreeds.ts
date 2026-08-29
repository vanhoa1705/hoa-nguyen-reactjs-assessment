import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchBreedsPage } from '../api/dogApi'
import { BREEDS_PAGE_LIMIT } from '../constants/api'

export function useBreeds() {
  const query = useInfiniteQuery({
    queryKey: ['breeds'],
    queryFn: ({ pageParam }) => fetchBreedsPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === BREEDS_PAGE_LIMIT ? allPages.length : undefined,
    staleTime: Infinity,
  })

  const breeds = useMemo(() => query.data?.pages.flat().sort((a, b) => a.id - b.id), [query.data])

  return {
    data: breeds,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
  }
}
