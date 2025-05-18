import { BookContentAttachmentType } from '../book-content-attachment-types'

export type BookContentAttachmentDTO = {
  type: BookContentAttachmentType,
  order: number,
  raw: string,
  content_id: string,
  delta_object: string,
}

export const makeDTO = (type: BookContentAttachmentType, order: number, raw: string, content_id: string, delta_object?: string): BookContentAttachmentDTO => ({
  type,
  order,
  raw,
  content_id,
  delta_object,
})

export default BookContentAttachmentDTO
