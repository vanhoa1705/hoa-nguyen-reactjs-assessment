import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useVotes } from '../../hooks/useVotes'
import { fetchBreedImage } from '../../api/dogApi'
import Skeleton from '../../components/Skeleton'
import type { Breed } from '../../types/breed'
import type { VoteValue } from '../../types/vote'

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

function CollectionCard({
  imageId,
  voteValue,
}: {
  imageId: string
  voteValue: VoteValue
}) {
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
      const cached = queryClient.getQueryData<InfiniteData<Breed[]>>(['breeds'])
      return cached?.pages.flat().find((b) => b.reference_image_id === imageId)
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

  const collection = useMemo(() => {
    const latestByImage = apiVotes.reduce<Record<string, (typeof apiVotes)[number]>>(
      (acc, v) => ({ ...acc, [v.image_id]: v }),
      {},
    )

    return Object.values(latestByImage).filter(
      (v) => filter === 'all' || String(v.value) === filter,
    )
  }, [apiVotes, filter])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 justify-center overflow-hidden px-5">
        <div className="flex w-full max-w-[720px] animate-df-in flex-col pt-6">
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
                onClick={() => setFilter(id)}
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
          <div className="flex-1 overflow-y-auto pb-6 -mx-5 px-5">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-[18px] border border-ink/10 bg-white">
                    <Skeleton className="h-44 rounded-none" />
                    <div className="px-3 pb-3.5 pt-3 flex flex-col gap-2">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : collection.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {collection.map((v) => (
                  <CollectionCard
                    key={v.image_id}
                    imageId={v.image_id}
                    voteValue={v.value}
                  />
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
    </div>
  )
}
