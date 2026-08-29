import { describe, expect, it } from 'vitest'
import { classifySwipe } from './swipe'

describe('classifySwipe', () => {
  it('returns none for small offset and low velocity', () => {
    expect(classifySwipe({ offset: { x: 50, y: 0 }, velocity: { x: 100, y: 0 } })).toBe('none')
  })

  it('returns like when offset exceeds threshold (right swipe)', () => {
    expect(classifySwipe({ offset: { x: 120, y: 0 }, velocity: { x: 50, y: 0 } })).toBe('like')
  })

  it('returns dislike when offset exceeds threshold (left swipe)', () => {
    expect(classifySwipe({ offset: { x: -120, y: 0 }, velocity: { x: -50, y: 0 } })).toBe('dislike')
  })

  it('returns like when velocity exceeds threshold regardless of offset', () => {
    expect(classifySwipe({ offset: { x: 30, y: 0 }, velocity: { x: 250, y: 0 } })).toBe('like')
  })

  it('returns dislike when velocity exceeds threshold to the left', () => {
    expect(classifySwipe({ offset: { x: -30, y: 0 }, velocity: { x: -250, y: 0 } })).toBe('dislike')
  })
})
