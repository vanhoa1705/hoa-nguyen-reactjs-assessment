import { useQuery } from '@tanstack/react-query'
import { fetchVotes } from '../api/dogApi'

export function useVotes() {
  const query = useQuery({
    queryKey: ['votes'],
    queryFn: () => fetchVotes(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
  }
}
