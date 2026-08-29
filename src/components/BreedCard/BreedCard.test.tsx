import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BreedCard from './BreedCard'
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
      // strip framer-motion-only props to avoid React DOM warnings
      drag: _drag,
      dragConstraints: _dc,
      dragElastic: _de,
      onDragStart: _ods,
      onDrag: _od,
      onDragEnd: _ode,
      whileDrag: _wd,
      ...rest
    }: any) => (
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
})
