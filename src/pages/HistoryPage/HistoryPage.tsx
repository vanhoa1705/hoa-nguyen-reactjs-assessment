import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useVotes } from '../../hooks/useVotes'
import { fetchBreedImage } from '../../api/dogApi'
import { BREEDS_PAGE_LIMIT } from '../../constants/api'
import Skeleton from '../../components/Skeleton'
import type { Breed } from '../../types/breed'
import type { VoteValue } from '../../types/vote'

const PAGE_SIZE = 10

type Filter = 'all' | '1' | '2' | '-1'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: '2', label: 'Super' },
  { id: '1', label: 'Liked' },
  { id: '-1', label: 'Passed' },
]

const BADGE: Record<number, { icon: string; color: string }> = {
  1: { icon: '♥', color: '#2E5BFF' },
  2: { icon: '★', color: '#F0A020' },
  [-1]: { icon: '✕', color: '#E5484D' },
}

function CollectionCard({ imageId, voteValue }: { imageId: string; voteValue: VoteValue }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: image } = useQuery({
    queryKey: ['image', imageId],
    queryFn: () => fetchBreedImage(imageId),
    staleTime: Infinity,
  })

  const badge = BADGE[voteValue]

  // Prefer breed from image response; fall back to breeds cache
  const breed =
    image?.breeds?.[0] ??
    (() => {
      for (let page = 0; ; page++) {
        const data = queryClient.getQueryData<Breed[]>(['breeds', 'page', page])
        if (!data) break
        const found = data.find((b) => b.reference_image_id === imageId)
        if (found) return found
        if (data.length < BREEDS_PAGE_LIMIT) break
      }
      return undefined
    })()

  function handleClick() {
    const breedId = breed?.id
    if (breedId) navigate(`/breeds/${breedId}`)
  }

  return (
    <button
      onClick={handleClick}
      className="overflow-hidden rounded-[18px] border border-ink/10 bg-white text-left transition-all hover:-translate-y-1"
      style={{ boxShadow: '0 2px 6px rgba(20,22,26,.05)' }}
    >
      <div
        className="relative h-44 bg-center bg-cover"
        style={{
          backgroundImage: image?.url
            ? `url(${image.url})`
            : `repeating-linear-gradient(28deg, rgba(20,22,26,.055) 0 10px, rgba(20,22,26,0) 10px 22px),
             radial-gradient(120% 90% at 30% 18%, rgba(255,255,255,.85), rgba(255,255,255,0) 60%),
             oklch(0.88 0.045 220)`,
        }}
      >
        <span
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-xl border border-white/35 bg-white/90 text-[15px] backdrop-blur-md"
          style={{ color: badge.color, boxShadow: '0 4px 12px -6px rgba(20,22,26,.4)' }}
        >
          {badge.icon}
        </span>
      </div>
      <div className="px-3 pb-3.5 pt-3">
        <div className="text-[15px] font-bold tracking-tight">{breed?.name ?? '—'}</div>
        <div className="mt-0.5 font-mono text-[10.5px] text-muted">
          {[breed?.breed_group, breed?.weight ? `${breed.weight.metric} kg` : undefined]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
    </button>
  )
}

export default function HistoryPage() {
  const { data: apiVotes = [], isLoading } = useVotes()
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gridRef.current?.scrollTo({ top: 0 })
  }, [page])

  function handleFilterChange(f: Filter) {
    setFilter(f)
    setPage(1)
  }

  const collection = useMemo(() => {
    const latestByImage = apiVotes.reduce<Record<string, (typeof apiVotes)[number]>>(
      (acc, v) => ({ ...acc, [v.image_id]: v }),
      {},
    )

    return Object.values(latestByImage).filter(
      (v) => filter === 'all' || String(v.value) === filter,
    )
  }, [apiVotes, filter])

  const totalPages = Math.max(1, Math.ceil(collection.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = collection.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const paginationPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce<(number | '…')[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable area */}
      <div className="flex flex-1 justify-center overflow-hidden px-5">
        <div className="flex w-full max-w-[720px] animate-df-in flex-col overflow-hidden pt-6">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <Link
              to="/"
              className="flex h-9 items-center rounded-xl border border-ink/10 bg-white px-3.5 text-[13px] font-medium text-ink hover:border-ink transition-colors"
            >
              ‹ Explore
            </Link>
            <h1 className="m-0 text-[19px] font-bold tracking-tight">Collection</h1>
          </div>

          {/* Filters */}
          <nav
            className="mb-5 flex gap-1.5 rounded-[18px] border p-1.5"
            style={{
              background: 'rgba(255,255,255,.9)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(20,22,26,.10)',
              boxShadow: '0 2px 8px -4px rgba(20,22,26,.12)',
            }}
          >
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleFilterChange(id)}
                className="flex flex-1 items-center justify-center rounded-[14px] py-2.5 text-[13px] font-medium transition-colors"
                style={
                  filter === id
                    ? {
                        background: '#fff',
                        color: 'var(--ink)',
                        boxShadow: '0 2px 6px rgba(20,22,26,.12)',
                      }
                    : { color: 'var(--muted)' }
                }
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Grid */}
          <div ref={gridRef} className="flex-1 overflow-y-auto pb-4 -mx-5 px-5">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-[18px] border border-ink/10 bg-white"
                  >
                    <Skeleton className="h-44 rounded-none" />
                    <div className="flex flex-col gap-2 px-3 pb-3.5 pt-3">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : collection.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {paginated.map((v) => (
                  <CollectionCard key={v.image_id} imageId={v.image_id} voteValue={v.value} />
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed border-ink/10 bg-white/50 px-5 py-11 text-center">
                <p className="text-[15px] font-medium">Nothing here yet</p>
                <p className="mt-1.5 text-[13px] text-muted">Go swipe some breeds and come back.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination — outside scroll, always visible at bottom */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-1.5 px-5 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 bg-white text-[13px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-30"
          >
            ‹
          </button>

          {paginationPages.map((item, i) =>
            item === '…' ? (
              <span key={`ellipsis-${i}`} className="w-9 text-center text-muted">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => setPage(item)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border text-[13px] font-medium transition-colors"
                style={
                  item === safePage
                    ? {
                        background: 'var(--accent)',
                        borderColor: 'var(--accent)',
                        color: '#fff',
                        boxShadow: '0 6px 16px -8px rgba(46,91,255,.9)',
                      }
                    : {
                        background: '#fff',
                        borderColor: 'rgba(20,22,26,.10)',
                        color: 'var(--ink)',
                      }
                }
              >
                {item}
              </button>
            ),
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 bg-white text-[13px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
