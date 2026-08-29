export type VoteValue = -1 | 1 | 2

export interface VotePayload {
  imageId: string
  value: VoteValue
  breedId: string
}

export interface VoteResponse {
  id: number
  message: string
}

export interface VoteRecord {
  id: number
  image_id: string
  value: VoteValue
  sub_id: string
  created_at: string
}
