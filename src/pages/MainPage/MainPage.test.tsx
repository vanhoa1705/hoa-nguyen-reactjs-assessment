import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MainPage from './MainPage'
import { useSwipeStore } from '../../stores/swipeStore'
import { renderWithProviders } from '../../test/utils'
import type { Breed } from '../../types/breed'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      onClick,
      className,
      style,
      'aria-disabled': ad,
      'data-testid': dtid,
      drag: _d,
      dragConstraints: _dc,
      dragElastic: _de,
      onDragStart: _ods,
      onDrag: _od,
      onDragEnd: _ode,
    }: any) => (
      <div
        onClick={onClick}
        className={className}
        style={style}
        aria-disabled={ad}
        data-testid={dtid}
      >
        {children}
      </div>
    ),
    button: ({ children, style: _s, ...props }: any) => <button {...props}>{children}</button>,
  },
  useMotionValue: (v: number) => ({ set: () => {}, get: () => v }),
  useTransform: () => ({ get: () => 1 }),
}))

vi.mock('../../api/dogApi', () => ({
  fetchBreedsPage: vi.fn(),
  postVote: vi.fn(),
  fetchVotes: vi.fn(),
}))

import { fetchBreedsPage, postVote, fetchVotes } from '../../api/dogApi'

const breeds: Breed[] = [
  {
    id: 1,
    name: 'Affenpinscher',
    life_span: '10 - 12 years',
    weight: { imperial: '6', metric: '3' },
    height: { imperial: '9', metric: '23' },
    reference_image_id: 'img-1',
  },
  {
    id: 2,
    name: 'Afghan Hound',
    life_span: '12 - 14 years',
    weight: { imperial: '50', metric: '25' },
    height: { imperial: '25', metric: '64' },
    reference_image_id: 'img-2',
  },
]

beforeEach(() => {
  useSwipeStore.setState({ currentBreedId: null, isDone: false })
  vi.mocked(fetchBreedsPage).mockResolvedValue(breeds)
  vi.mocked(fetchVotes).mockResolvedValue([])
  vi.mocked(postVote).mockResolvedValue({ id: 1, message: 'SUCCESS' })
})

describe('MainPage', () => {
  it('shows loading skeleton initially', () => {
    renderWithProviders(<MainPage />)
    expect(screen.getByLabelText('Loading breeds')).toBeInTheDocument()
  })

  it('shows breed name after data loads', async () => {
    renderWithProviders(<MainPage />)
    await waitFor(() => expect(screen.getAllByText('Affenpinscher').length).toBeGreaterThan(0))
  })

  it('calls postVote with value 1 when like button clicked', async () => {
    renderWithProviders(<MainPage />)
    await waitFor(() => screen.getByRole('button', { name: 'Like breed' }))
    await userEvent.click(screen.getByRole('button', { name: 'Like breed' }))
    await waitFor(() =>
      expect(postVote).toHaveBeenCalledWith(
        { imageId: 'img-1', value: 1, breedId: '1' },
        expect.any(Object),
      ),
    )
  })

  it('calls postVote with value -1 when dislike button clicked', async () => {
    renderWithProviders(<MainPage />)
    await waitFor(() => screen.getByRole('button', { name: 'Dislike breed' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dislike breed' }))
    await waitFor(() =>
      expect(postVote).toHaveBeenCalledWith(
        { imageId: 'img-1', value: -1, breedId: '1' },
        expect.any(Object),
      ),
    )
  })

  it('shows done state when isDone is true', async () => {
    useSwipeStore.setState({ currentBreedId: null, isDone: true })
    renderWithProviders(<MainPage />)
    await waitFor(() => expect(screen.getByTestId('done-state')).toBeInTheDocument())
    expect(screen.getByText(/seen all breeds/i)).toBeInTheDocument()
  })
})
