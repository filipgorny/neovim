import * as R from 'ramda'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'

export const transformChapterImages = R.when(
  R.has('chapter_images'),
  R.over(
    R.lensProp('chapter_images'),
    R.map(
      R.evolve({
        image: value => value ? generateStaticUrl(value) : null,
        small_ver: value => value ? generateStaticUrl(value) : null,
      })
    )
  )
)
