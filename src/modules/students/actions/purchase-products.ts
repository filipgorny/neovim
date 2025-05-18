import purchaseExam, { Payload as PurchaseExamPayload, getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import purchaseCourse, { Payload as PurchaseCoursePayload } from '../../student-courses/actions/purchase-course'
import purchaseExtention, { Payload as PurchaseExtentionPayload } from '../../student-courses/actions/purchase-extention'
import { schema } from '../../student-courses/validation/schema/purchase-course-token-payload-schema'
import mapP from '../../../../utils/function/mapp'
import validateEntityPayload from '@desmart/js-utils/dist/validation/validate-entity-payload'
import { findStudentByExternalId, getStudentByLikiRequest } from '../student-service'
import { throwException } from '@desmart/js-utils'
import { throwSpecialException } from '../../../../utils/error/error-factory'

type Payload = {
  exams?: Array<PurchaseExamPayload>,
  courses?: Array<PurchaseCoursePayload>,
  extentions?: Array<PurchaseExtentionPayload>
}

const returnExceptionWrapper = (external_id: string, fn: Function) => async (...args) => {
  try {
    await fn(...args)
    return {
      external_id,
      success: true,
    }
  } catch (e) {
    return {
      external_id,
      success: false,
      error: e,
    }
  }
}

export default async (request, payload: Payload) => {
  await getStudentByLikiRequest(request)

  let purchasedCourses, purchasedExams, purchasedExtentions
  let isError = false

  if (payload.courses) {
    purchasedCourses = await mapP(
      async (payload: PurchaseCoursePayload) => returnExceptionWrapper(payload.external_id, purchaseCourse)(request, payload)
    )(payload.courses)

    purchasedCourses.forEach(course => {
      if (course.success === false) {
        isError = true
      }
    })
  }
  if (payload.exams) {
    purchasedExams = await mapP(
      async (payload: PurchaseExamPayload) => returnExceptionWrapper(payload.external_id, purchaseExam)(request, payload)
    )(payload.exams)

    purchasedExams.forEach(exam => {
      if (exam.success === false) {
        isError = true
      }
    })
  }
  if (payload.extentions) {
    purchasedExtentions = await mapP(
      async (payload: PurchaseExtentionPayload) => returnExceptionWrapper(payload.external_id, purchaseExtention)(request, payload)
    )(payload.extentions)

    purchasedExtentions.forEach(exntention => {
      if (exntention.success === false) {
        isError = true
      }
    })
  }

  const result = {
    exams: purchasedExams,
    courses: purchasedCourses,
    extentions: purchasedExtentions,
  }
  if (!isError) {
    return result
  } else {
    throwSpecialException(result, 'purchase-products.failed', 400, 'Failed to purchase some or all products')
  }
}
