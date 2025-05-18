import { BookContentResourceType } from '../../book-content-resources/book-contennt-resource-types'

export type StudentBookContentResourceDTO = {
  content_id: string,
  raw: string,
  delta_object: string,
  external_id: string,
  order: string,
  type: BookContentResourceType,
  original_resource_id: string,
}

export const makeDTO = (
  content_id: string,
  raw: string,
  delta_object: string,
  external_id: string,
  order: string,
  type: BookContentResourceType,
  original_resource_id: string
): StudentBookContentResourceDTO => ({
  content_id,
  raw,
  delta_object,
  external_id,
  type,
  order,
  original_resource_id,
})

export default StudentBookContentResourceDTO
