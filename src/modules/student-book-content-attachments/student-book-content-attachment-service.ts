import { create, deleteAttachmentsByContentId, patch } from './student-book-content-attachment-repository'
import { makeDTO } from './dto/student-book-content-attachment-dto'
import mapP from '../../../utils/function/mapp'
import R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import { BookContentAttachmentType } from '../book-content-attachments/book-content-attachment-types'
import { UpdateBookContentAttachmentPayload } from './actions/update-book-content-attachment'

interface UpdateBookContentAttachmentCommand {
  id: string
}

export const createBookContentattachment = async (
  content_id: string,
  type: BookContentAttachmentType,
  raw: string,
  delta_object: string,
  order: number,
  original_attachment_id: string
) => (
  create(
    makeDTO(content_id, type, raw, delta_object, order, original_attachment_id)
  )
)

export const cretateBookContentAttachmentsFromOriginal = async (contentId, originals) => (
  mapP(
    R.pipeWith(R.andThen)([
      asAsync(R.juxt([
        R.always(contentId),
        R.prop('type'),
        R.prop('raw'),
        R.prop('delta_object'),
        R.prop('order'),
        R.prop('id'),
      ])),
      R.apply(createBookContentattachment),
    ])
  )(originals)
)

export const updateBookContentAttachment = (command: UpdateBookContentAttachmentCommand) => async (payload: UpdateBookContentAttachmentPayload) => {
  return await patch({
    id: command.id,
    data: {
      ...payload,
      delta_object: payload.delta_object ? JSON.stringify(payload.delta_object) : undefined,
    },
    select: ['id', 'content_id', 'raw', 'order', 'type', 'delta_object'],
  })
}

export const deleteByContentId = async (content_id: string) => (
  deleteAttachmentsByContentId(content_id)
)
