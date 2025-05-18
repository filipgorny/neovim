export enum BookContentTypeEnum {
  salty_comment = 'salty_comment',
  main_text = 'main_text',
  file = 'file'
}

export type BookContentType = keyof typeof BookContentTypeEnum

export const BookContentTypes = Object.values(BookContentTypeEnum)
