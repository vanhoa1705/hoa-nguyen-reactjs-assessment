import { useQuery } from '@tanstack/react-query'
import { fetchBreedsPage } from '../api/dogApi'
import type { Breed } from '../types/breed'

async function fetchAllBreeds(): Promise<Breed[]> {
  const [page0, page1] = await Promise.all([fetchBreedsPage(0), fetchBreedsPage(1)])
  const merged = [...page0, ...page1]
  // deduplicate by id (API may overlap between pages)
  return merged.filter((breed, idx, arr) => arr.findIndex((b) => b.id === breed.id) === idx)
}

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: fetchAllBreeds,
    staleTime: Infinity,
  })
}
