import mapP from '@desmart/js-utils/dist/function/mapp'
import { attachProductsToSingleStudent } from './helpers/add-products-helpers'

type Payload = {
  student_ids?: string[]
  course_ids?: string[]
  exam_ids?: string[]
}

export default async (payload: Payload) => (
  mapP(attachProductsToSingleStudent(payload))(payload.student_ids)
)
