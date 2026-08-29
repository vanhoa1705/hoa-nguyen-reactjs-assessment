import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postVote } from '../api/dogApi'
import { useSwipeStore } from '../stores/swipeStore'
import type { Breed } from '../types/breed'
import type { VoteValue } from '../types/vote'

export function useVoteActions(breeds: Breed[], hasNextPage = false) {
  const advance = useSwipeStore((s) => s.advance)
  const queryClient = useQueryClient()

  const { mutate, isPending, isError } = useMutation({
    mutationFn: postVote,
    onSuccess: () => {
      advance(breeds, hasNextPage)
      void queryClient.invalidateQueries({ queryKey: ['votes'] })
    },
  })

  function vote(breed: Breed, value: VoteValue) {
    if (breed.reference_image_id) {
      mutate({ imageId: breed.reference_image_id, value, breedId: String(breed.id) })
    } else {
      advance(breeds, hasNextPage)
    }
  }

  return { vote, isPending, isError }
}
