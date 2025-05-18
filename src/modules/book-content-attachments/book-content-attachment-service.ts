import * as R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import { create, findOneOrFail, patch, remove, fixAttachmentOrderAfterDeleting, removeWhere } from './book-content-attachment-repository'
import { BookContentAttachmentType, BookContentAttachmentTypeEnum } from './book-content-attachment-types'
import { makeDTO } from './dto/book-content-attachment-dto'

export const createBookContentAttachment = async (type: BookContentAttachmentType, order: number, raw: string, content_id: string, delta_object: object) => (
  create(
    makeDTO(type, order, raw, content_id, JSON.stringify(delta_object))
  )
)

export const updateBookContentAttachment = (id: string) => async (data: object) => (
  patch(id, data)
)

export const deleteAttachment = async (id: string) => {
  const attachment = await findOneOrFail({ id })
  const result = await remove(id)

  await fixAttachmentOrderAfterDeleting(attachment.content_id, attachment.order)

  return result
}

export const deleteAttachmentByBookContentId = async (content_id: string) => (
  removeWhere({ content_id })
)

export const cretateBookContentAttachmentsFromOriginal = async (contentId, originals) => (
  mapP(
    R.pipeWith(R.andThen)([
      asAsync(R.juxt([
        R.prop('type'),
        R.prop('order'),
        R.prop('raw'),
        R.always(contentId),
        R.prop('delta_object'),
      ])),
      R.apply(createBookContentAttachment),
    ])
  )(originals)
)
