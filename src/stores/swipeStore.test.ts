import { beforeEach, describe, expect, it } from 'vitest'
import { useSwipeStore } from './swipeStore'
import type { Breed } from '../types/breed'

const makeBreeds = (count: number): Breed[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Breed ${i + 1}`,
    life_span: '10 years',
    weight: { imperial: '10', metric: '5' },
    height: { imperial: '10', metric: '25' },
    reference_image_id: `img-${i + 1}`,
  }))

beforeEach(() => {
  useSwipeStore.setState({ currentBreedId: null, isDone: false })
})

describe('advance', () => {
  it('advances from null (first breed) to second breed', () => {
    const breeds = makeBreeds(3)
    useSwipeStore.getState().advance(breeds)
    expect(useSwipeStore.getState().currentBreedId).toBe('2')
  })

  it('advances from middle breed to next', () => {
    const breeds = makeBreeds(3)
    useSwipeStore.setState({ currentBreedId: '2' })
    useSwipeStore.getState().advance(breeds)
    expect(useSwipeStore.getState().currentBreedId).toBe('3')
  })

  it('sets isDone when advancing past the last breed', () => {
    const breeds = makeBreeds(2)
    useSwipeStore.setState({ currentBreedId: '2' })
    useSwipeStore.getState().advance(breeds)
    expect(useSwipeStore.getState().isDone).toBe(true)
  })

  it('does not change currentBreedId when done', () => {
    const breeds = makeBreeds(1)
    useSwipeStore.setState({ currentBreedId: '1' })
    useSwipeStore.getState().advance(breeds)
    expect(useSwipeStore.getState().isDone).toBe(true)
    expect(useSwipeStore.getState().currentBreedId).toBe('1')
  })
})

describe('reset', () => {
  it('resets to initial state', () => {
    useSwipeStore.setState({ currentBreedId: '5', isDone: true })
    useSwipeStore.getState().reset()
    expect(useSwipeStore.getState().currentBreedId).toBeNull()
    expect(useSwipeStore.getState().isDone).toBe(false)
  })
})
