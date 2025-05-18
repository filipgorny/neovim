import * as R from 'ramda'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'

export const transformContentImages = R.when(
  R.has('content_images'),
  R.over(
    R.lensProp('content_images'),
    R.pipe(
      R.map(
        R.evolve({
          image: generateStaticUrl,
          small_ver: generateStaticUrl,
        })
      ),
      R.sortWith([
        R.ascend(R.prop('part')),
        R.ascend(R.prop('order')),
      ]),
      R.uniqBy(R.prop('original_image_id'))
    )
  )
)
