import { Link, Outlet } from 'react-router-dom'

export default function AppLayout() {
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
      </header>

      <Outlet />
    </div>
  )
}
