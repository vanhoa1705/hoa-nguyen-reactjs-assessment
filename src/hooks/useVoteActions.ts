import { useMutation } from '@tanstack/react-query'
import { postVote } from '../api/dogApi'
import { useSwipeStore } from '../stores/swipeStore'
import type { Breed } from '../types/breed'
import type { VoteValue } from '../types/vote'

export function useVoteActions(breeds: Breed[]) {
  const advance = useSwipeStore((s) => s.advance)
  const recordVote = useSwipeStore((s) => s.recordVote)

  const { mutate, isPending } = useMutation({
    mutationFn: postVote,
    onSuccess: () => advance(breeds),
  })

  function vote(breed: Breed, value: VoteValue) {
    recordVote(String(breed.id), value)
    if (breed.reference_image_id) {
      mutate({ imageId: breed.reference_image_id, value })
    } else {
      advance(breeds)
    }
  }

  return { vote, isPending }
}
