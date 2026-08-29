import { useMemo } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useSwipeStore } from '../../stores/swipeStore'

export default function AppLayout() {
  const { votes, reset } = useSwipeStore()

  const likeCount = useMemo(() => Object.values(votes).filter((v) => v === 1).length, [votes])
  const nopeCount = useMemo(() => Object.values(votes).filter((v) => v === -1).length, [votes])
  const superCount = useMemo(() => Object.values(votes).filter((v) => v === 2).length, [votes])

  return (
    <div className="flex h-screen flex-col bg-bg overflow-hidden">
      <header
        className="sticky top-0 z-30 flex items-center gap-4 border-b border-ink/10 px-5 py-3.5"
        style={{ background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(10px)' }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="grid h-[30px] w-[30px] place-items-center rounded-[10px] bg-accent text-[15px] font-bold text-white"
            style={{ boxShadow: '0 6px 14px -6px rgba(46,91,255,.9)' }}
          >
            D
          </div>
          <div className="flex flex-col leading-[1.15]">
            <span className="text-[15px] font-bold tracking-[-0.01em]">DogFinder</span>
            <span className="font-mono text-[9.5px] tracking-[.08em] uppercase text-muted mt-0.5">
              swipe your next best friend
            </span>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2 rounded-full bg-ink/5 px-2.5 py-1.5 font-mono text-[11px]">
          <span className="text-nope">✕ {nopeCount}</span>
          <span className="opacity-30">·</span>
          <span className="text-accent">♥ {likeCount}</span>
          <span className="opacity-30">·</span>
          <span className="text-super">★ {superCount}</span>
        </div>

        <button
          onClick={reset}
          title="Clear saved progress"
          className="rounded-[11px] border border-ink/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted hover:border-ink hover:text-ink transition-colors"
        >
          Reset
        </button>
      </header>

      <Outlet />
    </div>
  )
}
