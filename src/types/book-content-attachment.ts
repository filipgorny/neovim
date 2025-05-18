import { BookContentAttachmentTypeEnum } from '../modules/book-content-attachments/book-content-attachment-types'

export type BookContentAttachment = {
  id: string,
  content_id: string,
  details: string,
  order: number,
  type: BookContentAttachmentTypeEnum,
}
