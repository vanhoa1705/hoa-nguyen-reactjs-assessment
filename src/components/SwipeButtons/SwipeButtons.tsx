import { motion, type MotionValue } from 'framer-motion'

interface SwipeButtonsProps {
  onLike: () => void
  onDislike: () => void
  likeScale?: MotionValue<number>
  dislikeScale?: MotionValue<number>
  disabled?: boolean
}

export default function SwipeButtons({
  onLike,
  onDislike,
  likeScale,
  dislikeScale,
  disabled,
}: SwipeButtonsProps) {
  const lineStyle =
    'border border-ink/10 bg-white disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex w-full items-center gap-3">
      <motion.button
        aria-label="Dislike breed"
        onClick={onDislike}
        disabled={disabled}
        style={{ scale: dislikeScale }}
        className={`${lineStyle} h-[52px] flex-1 rounded-[22px] text-nope text-[14px] font-medium flex items-center justify-center gap-2 hover:border-nope transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        ✕ Pass
      </motion.button>

      <motion.button
        aria-label="Like breed"
        onClick={onLike}
        disabled={disabled}
        style={{ scale: likeScale, boxShadow: '0 12px 24px -14px rgba(46,91,255,.95)' }}
        className="h-[52px] flex-1 rounded-[22px] bg-accent text-white text-[14px] font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
      >
        ♥ Like
      </motion.button>
    </div>
  )
}
