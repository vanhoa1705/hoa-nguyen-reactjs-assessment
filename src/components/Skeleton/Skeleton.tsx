import type { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export default function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-[22px] ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(20,22,26,.07) 25%, rgba(20,22,26,.13) 50%, rgba(20,22,26,.07) 75%)',
        backgroundSize: '400% 100%',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
