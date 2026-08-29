import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import DetailsPage from './DetailsPage'
import { useSwipeStore } from '../../stores/swipeStore'
import { renderWithProviders } from '../../test/utils'
import type { Breed } from '../../types/breed'

vi.mock('../../api/dogApi', () => ({
  fetchBreed: vi.fn(),
  fetchBreedImage: vi.fn(),
  postVote: vi.fn(),
  fetchVotes: vi.fn(),
}))

import { fetchBreed, fetchBreedImage, postVote, fetchVotes } from '../../api/dogApi'

const breeds: Breed[] = [
  {
    id: 42,
    name: 'Beagle',
    bred_for: 'Small game hunting',
    breed_group: 'Hound',
    life_span: '12 - 15 years',
    temperament: 'Amiable, Determined, Gentle',
    weight: { imperial: '18 - 30', metric: '8 - 14' },
    height: { imperial: '13 - 15', metric: '33 - 38' },
    reference_image_id: 'img-42',
  },
  {
    id: 43,
    name: 'Belgian Malinois',
    life_span: '14 - 16 years',
    weight: { imperial: '40 - 80', metric: '18 - 36' },
    height: { imperial: '22 - 26', metric: '56 - 66' },
  },
]

function makeQueryClient() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 5000 }, mutations: { retry: false } },
  })
  qc.setQueryData<Breed[]>(['breeds', 'page', 0], breeds)
  return qc
}

function renderDetails(breedId: string) {
  return renderWithProviders(<DetailsPage />, {
    initialEntries: [`/breeds/${breedId}`],
    routePath: '/breeds/:id',
    queryClient: makeQueryClient(),
  })
}

beforeEach(() => {
  useSwipeStore.setState({ currentBreedId: null, isDone: false })
  vi.mocked(fetchBreed).mockImplementation((id) => {
    const breed = breeds.find((b) => String(b.id) === id)
    return breed ? Promise.resolve(breed) : Promise.reject(new Error('Not found'))
  })
  vi.mocked(fetchBreedImage).mockResolvedValue({
    id: 'img-42',
    url: 'https://example.com/beagle.jpg',
    width: 800,
    height: 600,
  })
  vi.mocked(fetchVotes).mockResolvedValue([])
  vi.mocked(postVote).mockResolvedValue({ id: 1, message: 'SUCCESS' })
})

describe('DetailsPage', () => {
  it('shows breed name in header', async () => {
    renderDetails('42')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Beagle' })).toBeInTheDocument())
  })

  it('shows breed details', async () => {
    renderDetails('42')
    await waitFor(() => screen.getByRole('heading', { name: 'Beagle' }))
    expect(screen.getByText('Small game hunting')).toBeInTheDocument()
    expect(screen.getByText('Hound')).toBeInTheDocument()
    expect(screen.getByText('12 - 15 years')).toBeInTheDocument()
    expect(screen.getByText('Amiable, Determined, Gentle')).toBeInTheDocument()
  })

  it('hides optional fields when data is missing', async () => {
    renderDetails('43')
    await waitFor(() => screen.getByRole('heading', { name: 'Belgian Malinois' }))
    expect(screen.queryByText('Bred for')).not.toBeInTheDocument()
    expect(screen.queryByText('Breed group')).not.toBeInTheDocument()
    expect(screen.queryByText('Temperament')).not.toBeInTheDocument()
    expect(screen.queryByText('N/A')).not.toBeInTheDocument()
  })

  it('posts vote with value 1 when like clicked', async () => {
    renderDetails('42')
    await waitFor(() => screen.getByRole('button', { name: 'Like' }))
    await userEvent.click(screen.getByRole('button', { name: 'Like' }))
    await waitFor(() =>
      expect(postVote).toHaveBeenCalledWith(
        { imageId: 'img-42', value: 1, breedId: '42' },
        expect.any(Object),
      ),
    )
  })

  it('advances store when vote submitted', async () => {
    useSwipeStore.setState({ currentBreedId: '42' })
    renderDetails('42')
    await waitFor(() => screen.getByRole('button', { name: 'Dislike' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dislike' }))
    await waitFor(() => expect(useSwipeStore.getState().currentBreedId).toBe('43'))
  })

  it('shows not-found message for unknown breed id', async () => {
    renderDetails('9999')
    await waitFor(() => expect(screen.getByText('Breed not found.')).toBeInTheDocument())
  })
})
