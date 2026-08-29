import { useMemo } from 'react'
import { useMotionValue, useTransform } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useBreeds } from '../../hooks/useBreeds'
import { useVoteActions } from '../../hooks/useVoteActions'
import { useSwipeStore } from '../../stores/swipeStore'
import { fetchBreedImage } from '../../api/dogApi'
import BreedCard from '../../components/BreedCard'
import SwipeButtons from '../../components/SwipeButtons'
import Skeleton from '../../components/Skeleton'

function formatMeasurement(value: string | undefined, unit: string) {
  if (!value) return undefined

  const normalized = value
    .replace(/[–—]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .trim()
  const parts = normalized.split(/\s*;\s*/).filter(Boolean)

  if (parts.length > 1 && parts.every((part) => part.includes(':'))) {
    return parts.map((part) => `${part.replace(/:\s*/, ': ')} ${unit}`)
  }

  return [`${normalized} ${unit}`]
}

export default function MainPage() {
  const navigate = useNavigate()
  const { data: breeds, isLoading, isError, refetch } = useBreeds()
  const { currentBreedId, isDone, votes, undo, reset } = useSwipeStore()
  const { vote, isPending } = useVoteActions(breeds ?? [])

  const dragX = useMotionValue(0)
  const likeScale = useTransform(dragX, [0, 120], [1, 1.35])
  const dislikeScale = useTransform(dragX, [-120, 0], [1.35, 1])

  const likeCount = useMemo(() => Object.values(votes).filter((v) => v === 1).length, [votes])
  const nopeCount = useMemo(() => Object.values(votes).filter((v) => v === -1).length, [votes])

  const currentBreed = useMemo(() => {
    if (!breeds || breeds.length === 0) return undefined
    if (!currentBreedId) return breeds[0]
    return breeds.find((b) => String(b.id) === currentBreedId) ?? breeds[0]
  }, [breeds, currentBreedId])

  const currentIndex = useMemo(() => {
    if (!breeds) return 0
    if (!currentBreedId) return 0
    return breeds.findIndex((b) => String(b.id) === currentBreedId)
  }, [breeds, currentBreedId])

  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0
  const nextBreed = breeds?.[safeCurrentIndex + 1]
  const remaining = Math.max((breeds?.length ?? 0) - safeCurrentIndex, 0)

  const { data: image } = useQuery({
    queryKey: ['image', currentBreed?.reference_image_id],
    queryFn: () => fetchBreedImage(currentBreed!.reference_image_id!),
    enabled: !!currentBreed?.reference_image_id,
    staleTime: 5 * 60 * 1000,
  })

  useQuery({
    queryKey: ['image', nextBreed?.reference_image_id],
    queryFn: () => fetchBreedImage(nextBreed!.reference_image_id!),
    enabled: !!nextBreed?.reference_image_id,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <>
      {/* Main */}
      <main className="flex flex-1 overflow-auto justify-center gap-7 px-5 py-[26px] items-start">
        <aside className="hidden w-[216px] flex-none flex-col gap-2 animate-df-in min-[1120px]:flex">
          <span
            className="px-2.5 pb-1.5 font-mono text-[9.5px] tracking-[.1em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Navigation
          </span>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-between gap-2.5 rounded-[14px] border border-transparent px-3.5 py-3 text-left text-[13.5px] font-medium"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              boxShadow: '0 12px 24px -16px rgba(46,91,255,.95)',
            }}
          >
            <span>Explore</span>
            <span className="font-mono text-[11px] opacity-55">{remaining}</span>
          </button>
          <Link
            to="/history"
            className="flex items-center justify-between gap-2.5 rounded-[14px] px-3.5 py-3 text-[13.5px] font-medium hover:border-ink"
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              boxShadow: '0 1px 2px rgba(20,22,26,.04)',
            }}
          >
            <span>Collection</span>
            <span className="font-mono text-[11px] opacity-55">{Object.keys(votes).length}</span>
          </Link>
          <div
            className="mt-[18px] rounded-2xl border border-ink/10 bg-white p-3.5"
            style={{ boxShadow: '0 1px 2px rgba(20,22,26,.04)' }}
          >
            <span className="font-mono text-[9.5px] tracking-[.1em] uppercase text-muted">
              Keyboard
            </span>
            <div className="mt-3 flex flex-col gap-2.5 text-[12.5px] text-muted">
              <div className="flex items-center gap-2">
                <kbd className="rounded-md border border-ink/10 bg-bg px-1.5 py-0.5 font-mono text-[11px]">
                  ←
                </kbd>
                pass
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded-md border border-ink/10 bg-bg px-1.5 py-0.5 font-mono text-[11px]">
                  →
                </kbd>
                like
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded-md border border-ink/10 bg-bg px-1.5 py-0.5 font-mono text-[11px]">
                  ↑
                </kbd>
                super like
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded-md border border-ink/10 bg-bg px-1.5 py-0.5 font-mono text-[11px]">
                  ↵
                </kbd>
                view details
              </div>
            </div>
          </div>
        </aside>

        {/* Stage */}
        <section className="flex w-full max-w-[440px] flex-col items-center gap-[18px]">
          {isLoading && (
            <div className="flex w-full flex-col gap-4" aria-label="Loading breeds">
              <Skeleton className="w-full" style={{ aspectRatio: '3 / 4.15' }} />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-muted">Failed to load breeds.</p>
              <button
                onClick={() => refetch()}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
                style={{ boxShadow: '0 10px 22px -12px rgba(46,91,255,.95)' }}
              >
                Try again
              </button>
            </div>
          )}

          {isDone && (
            <div
              className="w-full rounded-[22px] border border-dashed border-ink/10 bg-white grid place-items-center p-8 text-center animate-df-in"
              style={{ aspectRatio: '3 / 4.15' }}
              data-testid="done-state"
            >
              <div>
                <p className="text-[20px] font-bold tracking-tight">You&apos;ve seen all breeds!</p>
                <p className="mt-2 mb-4 text-[13.5px] text-muted leading-relaxed">
                  You&apos;ve reviewed the whole list. Check out the ones you liked.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/history"
                    className="block rounded-[13px] bg-accent px-4 py-2.5 text-[13.5px] font-medium text-white text-center"
                    style={{ boxShadow: '0 10px 22px -12px rgba(46,91,255,.95)' }}
                  >
                    Open collection
                  </Link>
                  <button
                    onClick={reset}
                    className="rounded-[13px] border border-ink/10 bg-transparent px-4 py-2.5 text-[13.5px] font-medium text-ink"
                  >
                    Start over
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && !isDone && currentBreed && (
            <>
              <div
                className="relative w-full"
                style={{ aspectRatio: '3 / 4.15', marginTop: '2px' }}
              >
                <button
                  aria-label="Undo"
                  onClick={undo}
                  disabled={isPending}
                  className="absolute left-3 top-3 z-10 h-[52px] w-[52px] rounded-[18px] border border-white/35 bg-white/90 text-[20px] text-muted grid place-items-center backdrop-blur-md shadow-[0_12px_24px_-14px_rgba(20,22,26,.7)] hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ↺
                </button>
                <BreedCard
                  breed={currentBreed}
                  imageUrl={image?.url}
                  onLike={() => vote(currentBreed, 1)}
                  onDislike={() => vote(currentBreed, -1)}
                  onSuperLike={() => vote(currentBreed, 2)}
                  onPress={() => navigate(`/breeds/${currentBreed.id}`)}
                  onDragOffset={(x) => dragX.set(x)}
                  isPending={isPending}
                />
              </div>

              <SwipeButtons
                onLike={() => vote(currentBreed, 1)}
                onDislike={() => vote(currentBreed, -1)}
                likeScale={likeScale}
                dislikeScale={dislikeScale}
                disabled={isPending}
              />

              <p
                className="font-mono text-[10.5px] tracking-[.06em] text-muted text-center"
                data-testid="hint-line"
              >
                Swipe right to like, left to pass · {safeCurrentIndex + 1} / {breeds?.length ?? 0}
              </p>
            </>
          )}
        </section>

        {/* Right aside (desktop) */}
        {isLoading && (
          <aside className="hidden w-[262px] flex-none flex-col gap-3 min-[1120px]:flex">
            <div
              className="rounded-[18px] border border-ink/10 bg-white p-4"
              style={{ boxShadow: '0 1px 2px rgba(20,22,26,.04)' }}
            >
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="mt-3 h-6 w-36 rounded-lg" />
              <div className="mt-3 flex flex-col gap-2.5">
                {[80, 64, 56, 72].map((w) => (
                  <Skeleton key={w} className="h-4 rounded-md" style={{ width: `${w}%` }} />
                ))}
              </div>
              <Skeleton className="mt-4 h-10 w-full rounded-[13px]" />
            </div>
            <Skeleton className="h-[72px] w-full rounded-[18px]" />
          </aside>
        )}
        {currentBreed && !isDone && !isLoading && !isError && (
          <aside className="hidden w-[262px] flex-none flex-col gap-3 animate-df-in min-[1120px]:flex">
            <div
              className="rounded-[18px] border border-ink/10 bg-white p-4"
              style={{ boxShadow: '0 1px 2px rgba(20,22,26,.04)' }}
            >
              <span className="font-mono text-[9.5px] tracking-[.1em] uppercase text-muted">
                Now viewing
              </span>
              <div className="mt-2 text-[19px] font-bold tracking-tight">{currentBreed.name}</div>
              <div className="mt-3 flex flex-col gap-0">
                {[
                  {
                    label: 'Group',
                    valueLines: currentBreed.breed_group ? [currentBreed.breed_group] : undefined,
                  },
                  {
                    label: 'Weight',
                    valueLines: formatMeasurement(currentBreed.weight?.metric, 'kg'),
                  },
                  {
                    label: 'Height',
                    valueLines: formatMeasurement(currentBreed.height?.metric, 'cm'),
                  },
                  {
                    label: 'Life span',
                    valueLines: currentBreed.life_span ? [currentBreed.life_span] : undefined,
                  },
                ].map(({ label, valueLines }) =>
                  valueLines ? (
                    <div
                      key={label}
                      className="grid grid-cols-[74px_minmax(0,1fr)] items-start gap-3 border-b border-ink/10 py-2.5 text-[12.5px]"
                    >
                      <span className="whitespace-nowrap text-muted">{label}</span>
                      <span className="flex min-w-0 flex-col items-end gap-0.5 text-right font-medium leading-snug">
                        {valueLines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
              <button
                onClick={() => navigate(`/breeds/${currentBreed.id}`)}
                className="mt-3.5 w-full rounded-[13px] border border-ink/10 bg-bg py-2.5 text-[13px] font-medium text-ink hover:border-ink transition-colors"
              >
                View details
              </button>
            </div>

            <div className="rounded-[18px] border border-dashed border-ink/10 px-4 py-3.5">
              <span className="font-mono text-[9.5px] tracking-[.1em] uppercase text-muted">
                Progress
              </span>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                {safeCurrentIndex + 1} / {breeds?.length ?? 0} breeds · {likeCount} liked ·{' '}
                {nopeCount} passed
              </p>
            </div>
          </aside>
        )}
      </main>

      {/* Bottom nav (mobile) */}
      <nav
        className="sticky bottom-0 mx-auto mb-4 flex w-[calc(100%-40px)] max-w-[440px] gap-1.5 rounded-[18px] border p-1.5 min-[1120px]:hidden"
        style={{
          background: 'rgba(255,255,255,.9)',
          backdropFilter: 'blur(10px)',
          borderColor: 'var(--line)',
          boxShadow: '0 -6px 20px -14px rgba(20,22,26,.4)',
        }}
      >
        <button
          className="flex-1 rounded-[14px] py-2.5 text-[13px] font-medium"
          style={{
            background: '#fff',
            border: 'none',
            color: 'var(--ink)',
            boxShadow: '0 2px 6px rgba(20,22,26,.12)',
          }}
        >
          Explore
        </button>
        <Link
          to="/history"
          className="flex-1 rounded-[14px] py-2.5 text-[13px] font-medium text-center"
          style={{ color: 'var(--muted)' }}
        >
          Collection
        </Link>
      </nav>
    </>
  )
}
