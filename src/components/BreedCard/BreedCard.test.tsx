import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BreedCard from './BreedCard'
import type { Breed } from '../../types/breed'

// Capture drag handlers so tests can invoke them directly
const drag: {
  onDragStart?: (e: unknown, info: unknown) => void
  onDrag?: (e: unknown, info: unknown) => void
  onDragEnd?: (e: unknown, info: unknown) => void
} = {}

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      onClick,
      className,
      style,
      'aria-disabled': ad,
      'data-testid': dtid,
      drag: _drag,
      dragConstraints: _dc,
      dragElastic: _de,
      onDragStart,
      onDrag,
      onDragEnd,
      ...rest
    }: any) => {
      if (onDragStart !== undefined) drag.onDragStart = onDragStart
      if (onDrag !== undefined) drag.onDrag = onDrag
      if (onDragEnd !== undefined) drag.onDragEnd = onDragEnd
      return (
        <div
          onClick={onClick}
          className={className}
          style={style}
          aria-disabled={ad}
          data-testid={dtid}
          {...rest}
        >
          {children}
        </div>
      )
    },
    button: ({
      children,
      onClick,
      style,
      onPointerDown,
      type,
      'aria-label': al,
      disabled,
      ...rest
    }: any) => (
      <button
        type={type}
        aria-label={al}
        disabled={disabled}
        onClick={onClick}
        onPointerDown={onPointerDown}
        style={style}
        {...rest}
      >
        {children}
      </button>
    ),
  },
  useMotionValue: (v: number) => v,
  useTransform: () => 0,
}))

const breed: Breed = {
  id: 1,
  name: 'Affenpinscher',
  bred_for: 'Small rodent hunting',
  life_span: '10 - 12 years',
  weight: { imperial: '6 - 13', metric: '3 - 6' },
  height: { imperial: '9 - 11.5', metric: '23 - 29' },
  reference_image_id: 'img-1',
}

describe('BreedCard', () => {
  it('renders breed name', () => {
    render(<BreedCard breed={breed} onLike={vi.fn()} onDislike={vi.fn()} onPress={vi.fn()} />)
    expect(screen.getByText('Affenpinscher')).toBeInTheDocument()
  })

  it('renders bred_for text', () => {
    render(<BreedCard breed={breed} onLike={vi.fn()} onDislike={vi.fn()} onPress={vi.fn()} />)
    expect(screen.getByText('Small rodent hunting')).toBeInTheDocument()
  })

  it('renders background image when imageUrl provided', () => {
    render(
      <BreedCard
        breed={breed}
        imageUrl="https://example.com/dog.jpg"
        onLike={vi.fn()}
        onDislike={vi.fn()}
        onPress={vi.fn()}
      />,
    )
    const image = screen.getByRole('img', { name: 'Affenpinscher' })
    expect(image.style.backgroundImage).toContain('https://example.com/dog.jpg')
    expect(image.style.backgroundSize).toBe('contain')
  })

  it('shows solid background when no imageUrl', () => {
    render(<BreedCard breed={breed} onLike={vi.fn()} onDislike={vi.fn()} onPress={vi.fn()} />)
    const img = screen.getByRole('img', { name: 'Affenpinscher' })
    expect(img.style.backgroundColor).toBeTruthy()
    expect(img.style.backgroundImage).toBeFalsy()
  })

  it('calls onPress when clicked without drag', async () => {
    const onPress = vi.fn()
    render(<BreedCard breed={breed} onLike={vi.fn()} onDislike={vi.fn()} onPress={onPress} />)
    await userEvent.click(screen.getByTestId('breed-card'))
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('swipe up calls onSuperLike and does not trigger onPress', async () => {
    const onPress = vi.fn()
    const onSuperLike = vi.fn()
    render(
      <BreedCard
        breed={breed}
        onLike={vi.fn()}
        onDislike={vi.fn()}
        onPress={onPress}
        onSuperLike={onSuperLike}
      />,
    )

    // Simulate drag start → drag with large y offset → drag end
    drag.onDragStart?.(null, {})
    drag.onDrag?.(null, { offset: { x: 0, y: -150 } })
    drag.onDragEnd?.(null, { offset: { x: 0, y: -150 }, velocity: { x: 0, y: 0 } })

    // Click that framer-motion fires after drag end should be swallowed
    await userEvent.click(screen.getByTestId('breed-card'))

    expect(onSuperLike).toHaveBeenCalledOnce()
    expect(onPress).not.toHaveBeenCalled()
  })
})
