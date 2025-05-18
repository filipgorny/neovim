import { BookContentType } from '../../book-contents/book-content-types'
import { BookContentStatus } from '../book-content-statuses'

export type StudentBookContentDTO = {
  raw: string,
  delta_object: string,
  type: BookContentType,
  content_status: BookContentStatus,
  subchapter_id: string,
  original_content_id: string,
  order: number,
}

export const makeDTO = (raw: string, delta_object: string, type: BookContentType, content_status: BookContentStatus, subchapter_id: string, original_content_id: string, order: number): StudentBookContentDTO => ({
  raw,
  delta_object,
  type,
  content_status,
  subchapter_id,
  original_content_id,
  order,
})

export default StudentBookContentDTO
