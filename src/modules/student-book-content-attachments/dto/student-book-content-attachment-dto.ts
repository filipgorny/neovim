import { BookContentAttachmentType } from '../../book-content-attachments/book-content-attachment-types'

export type StudentBookContentAttachmentDTO = {
  content_id: string,
  type: BookContentAttachmentType,
  raw: string,
  delta_object: string,
  order: number,
  original_attachment_id: string,
}

export const makeDTO = (content_id: string, type: BookContentAttachmentType, raw: string, delta_object: string, order: number, original_attachment_id: string): StudentBookContentAttachmentDTO => ({
  content_id,
  type,
  raw,
  delta_object,
  order,
  original_attachment_id,
})

export default StudentBookContentAttachmentDTO
