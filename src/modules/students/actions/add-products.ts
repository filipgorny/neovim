import { attachProductsToSingleStudent } from './helpers/add-products-helpers'

type Payload = {
  course_ids?: string[]
  exam_ids?: string[]
}

export default async (id: string, payload: Payload) => (
  attachProductsToSingleStudent(payload)(id)
)
