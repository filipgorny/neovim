import R from 'ramda'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../book-content-attachment-repository'
import { BookContentAttachmentTypeEnum } from '../book-content-attachment-types'

export const mapAttachment = attachment => ({
  ...attachment,
  delta_object: JSON.parse(attachment.delta_object),
  ...attachment.type === BookContentAttachmentTypeEnum.file && {
    url: generatePresignedUrl(attachment.raw),
    delta_object: null,
    ...JSON.parse(attachment.delta_object),
  },
})

export default async id => R.pipeWith(R.andThen)([
  async () => find({ content_id: id }),
  R.prop('data'),
  collectionToJson,
  R.sortBy(R.prop('order')),
  R.map(mapAttachment),
])(true)
