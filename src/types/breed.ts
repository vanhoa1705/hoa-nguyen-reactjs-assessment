export interface Breed {
  id: number
  name: string
  bred_for?: string
  breed_group?: string
  life_span: string
  temperament?: string
  weight: { imperial: string; metric: string }
  height: { imperial: string; metric: string }
  reference_image_id?: string
  image?: { id: string; url: string; width: number; height: number }
  description?: string
  history?: string
  alt_names?: string
  origin?: string
  wikipedia_url?: string
}

export interface BreedImage {
  id: string
  url: string
  width: number
  height: number
  breeds?: Breed[]
}
