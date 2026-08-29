import { useQuery } from '@tanstack/react-query'
import { fetchVotes } from '../api/dogApi'

export function useVotes() {
  return useQuery({
    queryKey: ['votes'],
    queryFn: fetchVotes,
    staleTime: 30_000,
  })
}
