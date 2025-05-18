import R from 'ramda'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../book-content-repository'
import { BookContentTypeEnum } from '../book-content-types'

const defaultQuery = ({
  order: {
    by: 'order',
    dir: 'asc',
  },
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

export const mapContent = content => ({
  ...content,
  delta_object: JSON.parse(content.delta_object),
  ...content.type === BookContentTypeEnum.file && {
    url: generatePresignedUrl(content.raw),
    delta_object: null,
    ...JSON.parse(content.delta_object),
  },
})

export default async (subchapter_id, query) => R.pipeWith(R.andThen)([
  async () => find(prepareQuery(query), { subchapter_id }),
  R.over(
    R.lensProp('data'),
    R.pipe(
      collectionToJson,
      R.map(mapContent)
    )
  ),
])(true)
