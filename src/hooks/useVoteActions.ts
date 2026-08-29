import { useMutation } from '@tanstack/react-query'
import { postVote } from '../api/dogApi'
import { useSwipeStore } from '../stores/swipeStore'
import type { Breed } from '../types/breed'
import type { VoteValue } from '../types/vote'

export function useVoteActions(breeds: Breed[]) {
  const advance = useSwipeStore((s) => s.advance)

  const { mutate, isPending } = useMutation({
    mutationFn: postVote,
    onSuccess: () => advance(breeds),
  })

  function vote(imageId: string, value: VoteValue) {
    mutate({ imageId, value })
  }

  return { vote, isPending }
}
