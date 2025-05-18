import R from 'ramda'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { BookContentTypeEnum } from '../../book-contents/book-content-types'
import { findAllSubchaptersWithinPart } from '../book-subchapter-repository'

const mapContent = content => ({
  ...content,
  raw: content.type === BookContentTypeEnum.file ? generatePresignedUrl(content.raw) : content.raw,
  delta_object: content.delta_object,
})

const mapSubchapter = R.over(
  // @ts-ignore
  R.lensProp('contents'),
  R.map(mapContent)
)

export default async (chapter_id, part) => R.pipeWith(R.andThen)([
  async () => findAllSubchaptersWithinPart(part, chapter_id, ['contents']),
  R.prop('data'),
  collectionToJson,
  R.sortBy(R.prop('order')),
  R.map(mapSubchapter),
])(true)
