import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Skeleton from '../../components/Skeleton'
import { useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useVotes } from '../../hooks/useVotes'
import { useSwipeStore } from '../../stores/swipeStore'
import { fetchBreed, fetchBreedImage, postVote } from '../../api/dogApi'
import type { Breed } from '../../types/breed'
import type { VoteValue } from '../../types/vote'

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null

  return (
    <div className="flex flex-col gap-1 border-b border-ink/10 py-[13px] last:border-0">
      <span className="font-mono text-[9.5px] tracking-[.11em] uppercase text-muted">{label}</span>
      <span className="text-[15.5px] font-medium leading-snug">{value}</span>
    </div>
  )
}

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const advance = useSwipeStore((s) => s.advance)
  const { data: apiVotes = [] } = useVotes()

  const { data: breed, isLoading } = useQuery({
    queryKey: ['breed', id],
    queryFn: () => fetchBreed(id!),
    enabled: !!id,
    staleTime: Infinity,
    initialData: () => {
      const cached = queryClient.getQueryData<InfiniteData<Breed[]>>(['breeds'])
      return cached?.pages.flat().find((b) => String(b.id) === id)
    },
  })

  const voteValue = breed?.reference_image_id
    ? [...apiVotes].reverse().find((v) => v.image_id === breed.reference_image_id)?.value
    : undefined

  const imageUrl = breed?.image?.url

  const { data: fetchedImage } = useQuery({
    queryKey: ['image', breed?.reference_image_id],
    queryFn: () => fetchBreedImage(breed!.reference_image_id!),
    enabled: !!breed?.reference_image_id && !imageUrl,
    staleTime: Infinity,
  })

  const image = { url: imageUrl ?? fetchedImage?.url }

  function goBack() {
    if (location.key === 'default') navigate('/', { replace: true })
    else navigate(-1)
  }

  function getBreeds() {
    const cached = queryClient.getQueryData<InfiniteData<Breed[]>>(['breeds'])
    return cached?.pages.flat() ?? []
  }

  const { mutate } = useMutation({
    mutationFn: postVote,
    onSuccess: () => {
      advance(getBreeds())
      void queryClient.invalidateQueries({ queryKey: ['votes'] })
      goBack()
    },
  })

  function handleVote(value: VoteValue) {
    if (!breed) return
    if (breed.reference_image_id) {
      mutate({ imageId: breed.reference_image_id, value, breedId: String(breed.id) })
    } else {
      advance(getBreeds())
      goBack()
    }
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 overflow-hidden justify-center px-5 py-6 items-start">
        <div
          className="flex w-full max-w-[440px] flex-col overflow-hidden rounded-[22px] border border-ink/10 bg-white"
          style={{ maxHeight: '100%', boxShadow: '0 24px 50px -24px rgba(20,22,26,.34)' }}
        >
          <Skeleton className="h-[320px] rounded-none rounded-t-[22px]" />
          <div className="flex flex-col gap-3 px-5 py-5">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>
      </main>
    )
  }

  if (!breed) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted">Breed not found.</p>
      </div>
    )
  }

  const weight = breed.weight?.metric ? `${breed.weight.metric} kg` : undefined
  const height = breed.height?.metric ? `${breed.height.metric} cm` : undefined

  return (
    <main className="flex flex-1 overflow-hidden justify-center px-5 py-6 items-start">
      <div
        className="flex w-full max-w-[440px] flex-col overflow-hidden rounded-[22px] border border-ink/10 bg-white animate-df-in"
        style={{ maxHeight: '100%', boxShadow: '0 24px 50px -24px rgba(20,22,26,.34)' }}
      >
        {/* Photo */}
        <div className="relative h-[320px]">
          <div
            className="absolute inset-0 bg-center"
            role="img"
            aria-label={breed.name}
            style={{
              backgroundImage: image?.url
                ? `url(${image.url})`
                : `repeating-linear-gradient(28deg, rgba(20,22,26,.055) 0 10px, rgba(20,22,26,0) 10px 22px),
                    radial-gradient(120% 90% at 30% 18%, rgba(255,255,255,.85), rgba(255,255,255,0) 60%),
                    linear-gradient(135deg, #eef3ff, #f6efe3)`,
              backgroundSize: image?.url ? 'contain' : 'auto',
              backgroundRepeat: image?.url ? 'no-repeat' : 'repeat',
              backgroundColor: '#f2f1ee',
            }}
          />
          {/* Gradient */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
            style={{
              background:
                'linear-gradient(to top, rgba(10,11,13,.88), rgba(10,11,13,.42) 55%, transparent)',
            }}
          />
          {/* Back */}
          <button
            onClick={goBack}
            className="absolute left-3.5 top-3.5 flex h-9 items-center gap-1.5 rounded-xl border-none bg-white/90 px-3.5 text-[13px] font-medium text-ink"
            style={{
              backdropFilter: 'blur(6px)',
              boxShadow: '0 6px 16px -8px rgba(20,22,26,.5)',
            }}
          >
            ‹ Back
          </button>
          {/* Super like — hidden if already voted */}
          {voteValue === undefined && <button
            aria-label="Super like"
            onClick={() => handleVote(2)}
            className="absolute right-3 top-3 grid h-[52px] w-[52px] place-items-center rounded-[18px] border border-white/35 bg-white/90 text-[20px] text-super backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:border-super"
            style={{ boxShadow: '0 12px 24px -14px rgba(20,22,26,.7)' }}
          >
            ★
          </button>}
          {/* Name + vote tag */}
          <div className="absolute inset-x-5 bottom-[18px] flex items-end gap-3">
            <h1
              className="m-0 flex-1 text-[32px] font-bold leading-tight tracking-[-0.025em] text-white"
              style={{ textShadow: '0 2px 18px rgba(10,11,13,.55)' }}
            >
              {breed.name}
            </h1>
            {(() => {
              const v = voteValue
              if (v === undefined) return null
              const map: Record<number, { icon: string; label: string; color: string }> = {
                1: { icon: '♥', label: 'Liked', color: '#2E5BFF' },
                2: { icon: '★', label: 'Super', color: '#F0A020' },
                [-1]: { icon: '✕', label: 'Passed', color: '#E5484D' },
              }
              const badge = map[v]
              if (!badge) return null
              return (
                <span
                  className="flex-none flex items-center gap-1.5 rounded-xl border border-white/35 bg-white/90 px-2.5 py-1.5 font-mono text-[11px] font-medium backdrop-blur-md"
                  style={{ color: badge.color, boxShadow: '0 4px 12px -6px rgba(20,22,26,.4)' }}
                >
                  {badge.icon} {badge.label}
                </span>
              )
            })()}
          </div>
        </div>

        {/* Fields — scrollable */}
        <div className="flex-1 overflow-y-auto grid gap-0.5 px-5 pb-2 pt-[22px]">
          {breed.description && (
            <div className="border-b border-ink/10 py-[13px]">
              <span className="font-mono text-[9.5px] tracking-[.11em] uppercase text-muted">
                Description
              </span>
              <p className="mt-1 text-[15px] leading-relaxed text-ink/80">{breed.description}</p>
            </div>
          )}
          {breed.history && (
            <div className="border-b border-ink/10 py-[13px]">
              <span className="font-mono text-[9.5px] tracking-[.11em] uppercase text-muted">
                History
              </span>
              <p className="mt-1 text-[15px] leading-relaxed text-ink/80">{breed.history}</p>
            </div>
          )}
          <InfoRow label="Alt names" value={breed.alt_names} />
          <InfoRow label="Origin" value={breed.origin} />
          <InfoRow label="Bred for" value={breed.bred_for} />
          <InfoRow label="Weight" value={weight} />
          <InfoRow label="Height" value={height} />
          <InfoRow label="Breed group" value={breed.breed_group} />
          <InfoRow label="Temperament" value={breed.temperament} />
          <InfoRow label="Life span" value={breed.life_span} />
          {breed.wikipedia_url && (
            <div className="py-[13px]">
              <span className="font-mono text-[9.5px] tracking-[.11em] uppercase text-muted">
                Wikipedia
              </span>
              <a
                href={breed.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-[15px] font-medium text-accent underline-offset-2 hover:underline"
              >
                {breed.wikipedia_url.replace('https://', '')}
              </a>
            </div>
          )}
        </div>

        {/* Action buttons — hidden if already voted */}
        {voteValue === undefined && <div className="flex gap-2.5 px-5 pb-[22px] pt-4">
          <button
            aria-label="Dislike"
            onClick={() => handleVote(-1)}
            className="flex flex-1 h-[52px] items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white text-[14px] font-medium text-nope hover:border-nope transition-colors"
          >
            ✕ Pass
          </button>
          <button
            aria-label="Like"
            onClick={() => handleVote(1)}
            className="flex flex-1 h-[52px] items-center justify-center gap-2 rounded-2xl border-none text-[14px] font-medium text-white bg-accent"
            style={{ boxShadow: '0 12px 24px -14px rgba(46,91,255,.95)' }}
          >
            ♥ Like
          </button>
        </div>}
      </div>
    </main>
  )
}
