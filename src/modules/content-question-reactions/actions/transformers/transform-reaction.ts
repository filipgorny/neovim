import * as R from 'ramda'
import generatePresignedUrl from '../../../../../services/s3/generate-presigned-url'

const transform = reaction => R.mergeLeft({
  animation_url: generatePresignedUrl(reaction.animation),
  sound_url: generatePresignedUrl(reaction.sound),
})(reaction)

export const transformReaction = R.pipe(
  R.when(
    R.hasIn('toJSON'),
    R.invoker(0, 'toJSON')
  ),
  R.ifElse(
    Array.isArray,
    R.map(transform),
    transform
  )
)
