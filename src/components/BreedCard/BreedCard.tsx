import { useRef } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { classifySwipe } from '../../utils/swipe'
import { CLICK_MAX_OFFSET } from '../../constants/swipe'
import type { Breed } from '../../types/breed'

interface BreedCardProps {
  breed: Breed
  imageUrl?: string
  onLike: () => void
  onDislike: () => void
  onSuperLike?: () => void
  onPress: () => void
  onDragOffset?: (x: number) => void
  isPending?: boolean
}

export default function BreedCard({
  breed,
  imageUrl,
  onLike,
  onDislike,
  onSuperLike,
  onPress,
  onDragOffset,
  isPending,
}: BreedCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const likeOpacity = useTransform(x, [0, 110], [0, 1])
  const dislikeOpacity = useTransform(x, [-110, 0], [1, 0])
  const wasDraggingRef = useRef(false)

  function handleDragEnd(_: unknown, info: PanInfo) {
    onDragOffset?.(0)
    if (isPending) return
    const direction = classifySwipe(info)
    if (direction === 'like') onLike()
    else if (direction === 'dislike') onDislike()
  }

  const tags = [
    breed.breed_group,
    breed.weight ? `${breed.weight.metric} kg` : undefined,
    breed.height ? `${breed.height.metric} cm` : undefined,
    breed.life_span,
  ].filter(Boolean) as string[]

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      style={{
        x,
        rotate,
        touchAction: 'none',
        boxShadow: '0 24px 50px -20px rgba(20,22,26,.42), 0 2px 6px rgba(20,22,26,.07)',
        border: '1px solid rgba(255,255,255,.6)',
      }}
      data-testid="breed-card"
      aria-disabled={isPending}
      tabIndex={0}
      role="button"
      onDragStart={() => {
        wasDraggingRef.current = false
      }}
      onDrag={(_: unknown, info: PanInfo) => {
        if (Math.abs(info.offset.x) > CLICK_MAX_OFFSET) wasDraggingRef.current = true
        onDragOffset?.(info.offset.x)
      }}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (isPending) return
        if (!wasDraggingRef.current) onPress()
        wasDraggingRef.current = false
      }}
className="relative w-full aspect-[3/4.15] rounded-[22px] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      <div
        className="absolute inset-0 bg-center"
        role="img"
        aria-label={breed.name}
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#e8e6e1',
        }}
      />

      {onSuperLike && (
        <button
          type="button"
          aria-label="Super like breed"
          title="Super like"
          disabled={isPending}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onSuperLike()
          }}
          className="absolute right-3 top-3 z-[8] grid h-[52px] w-[52px] place-items-center rounded-[18px] border border-white/35 bg-white/90 text-[20px] text-super shadow-[0_12px_24px_-14px_rgba(20,22,26,.7)] backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:border-super disabled:cursor-not-allowed disabled:opacity-50"
        >
          ★
        </button>
      )}

      {/* LIKE stamp */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute top-[58px] left-[18px] z-[6] rotate-[-12deg] rounded-xl border-[3px] border-accent bg-white/90 px-3.5 py-1.5 text-lg font-black tracking-tight text-accent"
      >
        LIKE
      </motion.div>

      {/* NOPE stamp */}
      <motion.div
        style={{ opacity: dislikeOpacity }}
        className="pointer-events-none absolute top-[58px] right-[18px] z-[6] rotate-[12deg] rounded-xl border-[3px] border-nope bg-white/90 px-3.5 py-1.5 text-lg font-black tracking-tight text-nope"
      >
        NOPE
      </motion.div>

      {/* Bottom gradient overlay with breed info */}
      <div
        className="absolute inset-x-0 bottom-0 z-[5] px-[18px] pb-[18px] pt-16"
        style={{
          background:
            'linear-gradient(to top, rgba(10,11,13,.86), rgba(10,11,13,.55) 55%, transparent)',
        }}
      >
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-[27px] font-bold leading-tight tracking-tight text-white">
              {breed.name}
            </h2>
            {breed.bred_for && (
              <p className="mt-1 text-[13.5px] leading-snug text-white/80">{breed.bred_for}</p>
            )}
            {tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 min-[1120px]:hidden">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] tracking-[.04em] text-white rounded-lg border border-white/24 bg-white/[.17] px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
