import * as R from 'ramda'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../../../services/vimeo/get-vimeo-static-link'

export const transformResources = R.when(
  R.has('resources'),
  R.over(
    R.lensProp('resources'),
    R.map(
      R.evolve({
        external_id: R.always(undefined),
        video_thumbnail: value => value ? generateStaticUrl(value) : null,
        video_source: value => value ? getVimeoStaticLink(value) : null,
      })
    )
  )
)
