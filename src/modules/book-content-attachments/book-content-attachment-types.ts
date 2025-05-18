export enum BookContentAttachmentTypeEnum {
  salty_comment = 'salty_comment',
  main_text = 'main_text',
  file = 'file'
}

export type BookContentAttachmentType = keyof typeof BookContentAttachmentTypeEnum

export const BookContentAttachmentTypes = Object.values(BookContentAttachmentTypeEnum)
