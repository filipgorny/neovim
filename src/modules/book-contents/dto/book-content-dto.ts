import { BookContentType } from '../book-content-types'

export type BookContentDTO = {
  type: BookContentType,
  order: number,
  raw: string,
  delta_object: string,
  subchapter_id: string,
  content_html: string,
}

export const makeDTO = (type: BookContentType, order: number, raw: string, delta_object: string, subchapter_id: string, content_html?: string): BookContentDTO => ({
  type,
  order,
  raw,
  delta_object,
  subchapter_id,
  content_html,
})

export default BookContentDTO
