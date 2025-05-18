import * as R from 'ramda'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'

export const transformChapterImages = R.when(
  R.has('chapter_images'),
  R.over(
    R.lensProp('chapter_images'),
    R.pipe(
      R.map(
        R.evolve({
          image: generateStaticUrl,
          small_ver: generateStaticUrl,
        })
      ),
      R.sortWith([
        R.ascend(R.prop('order')),
      ])
    )
  )
)
