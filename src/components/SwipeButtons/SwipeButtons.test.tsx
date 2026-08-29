import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SwipeButtons from './SwipeButtons'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, style: _s, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

describe('SwipeButtons', () => {
  it('renders like and dislike buttons', () => {
    render(<SwipeButtons onLike={vi.fn()} onDislike={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Like breed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dislike breed' })).toBeInTheDocument()
  })

  it('calls onLike when like button clicked', async () => {
    const onLike = vi.fn()
    render(<SwipeButtons onLike={onLike} onDislike={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Like breed' }))
    expect(onLike).toHaveBeenCalledOnce()
  })

  it('calls onDislike when dislike button clicked', async () => {
    const onDislike = vi.fn()
    render(<SwipeButtons onLike={vi.fn()} onDislike={onDislike} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dislike breed' }))
    expect(onDislike).toHaveBeenCalledOnce()
  })

  it('disables buttons when disabled prop is true', () => {
    render(<SwipeButtons onLike={vi.fn()} onDislike={vi.fn()} disabled />)
    expect(screen.getByRole('button', { name: 'Like breed' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Dislike breed' })).toBeDisabled()
  })
})
