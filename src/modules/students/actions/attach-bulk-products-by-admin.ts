import { throwException } from '@desmart/js-utils'
import { findStudent } from '../student-service'
import attachProducts, { Payload as ProductsPayload } from './attach-products'
import { throwSpecialException } from '../../../../utils/error/error-factory'

type Payload = ProductsPayload & {
  student_ids: string[],
}

export default async (payload: Payload) => {
  const result = []
  let isError = false

  for (const student_id of payload.student_ids) {
    let student, products

    try {
      student = await findStudent(student_id)
    } catch (e) {
      isError = true
      result.push({
        student_id,
        error: e,
      })

      continue
    }

    try {
      products = await attachProducts(student, payload)
    } catch (e) {
      isError = true
      result.push({
        student_id,
        error: e,
      })
    }

    if (products) {
      result.push({
        student_id,
        products,
      })
    }
  }

  if (!isError) {
    return result
  } else {
    throwSpecialException({
      result,
    }, 'attach-bulk-products-by-admin.failed', 400, 'Failed to attach some or all products to students')
  }
}
