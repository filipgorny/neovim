import * as R from 'ramda'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'

export const transformContentImages = R.when(
  R.has('content_images'),
  R.over(
    R.lensProp('content_images'),
    R.map(
      R.evolve({
        image: value => value ? generateStaticUrl(value) : null,
        small_ver: value => value ? generateStaticUrl(value) : null,
      })
    )
  )
)
