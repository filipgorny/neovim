import { BookContentResourceType } from '../book-contennt-resource-types'

export type BookContentResourceDTO = {
  type: BookContentResourceType,
  order: number,
  raw: string,
  delta_object: string,
  content_id: string,
  external_id: string,
}

export const makeDTO = (type: BookContentResourceType, order: number, raw: string, delta_object: string, content_id: string, external_id: string): BookContentResourceDTO => ({
  type,
  order,
  raw,
  delta_object,
  content_id,
  external_id,
})

export default BookContentResourceDTO
