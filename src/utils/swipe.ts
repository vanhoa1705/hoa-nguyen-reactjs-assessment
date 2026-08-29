import { SWIPE_OFFSET_THRESHOLD, SWIPE_VELOCITY_THRESHOLD } from '../constants/swipe'

export type SwipeDirection = 'like' | 'dislike' | 'none'

export interface SwipeInfo {
  velocity: { x: number; y: number }
  offset: { x: number; y: number }
}

export function classifySwipe(info: SwipeInfo): SwipeDirection {
  const isSwipe =
    Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD ||
    Math.abs(info.offset.x) > SWIPE_OFFSET_THRESHOLD
  if (!isSwipe) return 'none'
  return info.offset.x > 0 ? 'like' : 'dislike'
}
