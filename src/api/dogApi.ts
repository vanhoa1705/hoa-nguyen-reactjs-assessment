import { DOG_API_KEY, SUB_ID } from '../config/env'
import { API_BASE_URL, BREEDS_PAGE_LIMIT } from '../constants/api'
import type { Breed, BreedImage } from '../types/breed'
import type { VotePayload, VoteRecord, VoteResponse } from '../types/vote'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DOG_API_KEY,
      ...options?.headers,
    },
  })

  if (!res.ok) throw new Error(`[${res.status}] ${path}`)

  return res.json() as Promise<T>
}

export async function fetchBreedsPage(page: number): Promise<Breed[]> {
  return apiFetch<Breed[]>(`/breeds?limit=${BREEDS_PAGE_LIMIT}&page=${page}`)
}

export async function fetchBreedImage(imageId: string): Promise<BreedImage> {
  return apiFetch<BreedImage>(`/images/${imageId}`)
}

export async function postVote(payload: VotePayload): Promise<VoteResponse> {
  return apiFetch<VoteResponse>('/votes', {
    method: 'POST',
    body: JSON.stringify({
      image_id: payload.imageId,
      value: payload.value,
      sub_id: SUB_ID,
    }),
  })
}

export async function fetchVotes(): Promise<VoteRecord[]> {
  return apiFetch<VoteRecord[]>(`/votes?sub_id=${SUB_ID}`)
}
