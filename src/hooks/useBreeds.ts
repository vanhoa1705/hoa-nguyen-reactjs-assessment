import { useQuery } from '@tanstack/react-query'
import { fetchBreedsPage } from '../api/dogApi'
import type { Breed } from '../types/breed'

async function fetchAllBreeds(): Promise<Breed[]> {
  const results = await Promise.allSettled([fetchBreedsPage(0), fetchBreedsPage(1)])
  const merged = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

  if (merged.length === 0) throw new Error('All breed pages failed to load')

  return merged.filter((breed, idx, arr) => arr.findIndex((b) => b.id === breed.id) === idx)
}

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: fetchAllBreeds,
    staleTime: Infinity,
  })
}
