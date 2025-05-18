import { Payload as PurchaseExamPayload } from '../../student-exams/actions/purchase-exam'
import { Payload as PurchaseCoursePayload } from '../../student-courses/actions/purchase-course'
import { Payload as PurchaseExtentionPayload } from '../../student-courses/actions/purchase-extention'
import { purchaseCourse, purchaseExtention } from '../../student-courses/student-course-service'
import { purchaseExam } from '../../student-exams/student-exam-service'
import mapP from '../../../../utils/function/mapp'
import { throwException } from '@desmart/js-utils'
import { throwSpecialException } from '../../../../utils/error/error-factory'

export type Payload = {
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
    console.log(e)

    return {
      external_id,
      success: false,
      error: e,
    }
  }
}

export default async (student, payload: Payload) => {
  let purchasedCourses, purchasedExams, purchasedExtentions
  let isError = false

  if (payload.courses) {
    purchasedCourses = await mapP(
      async (payload: PurchaseCoursePayload) => returnExceptionWrapper(payload.external_id, purchaseCourse)(student, payload)
    )(payload.courses)

    purchasedCourses.forEach(course => {
      if (course.success === false) {
        isError = true
      }
    })
  }
  if (payload.exams) {
    purchasedExams = await mapP(
      async (payload: PurchaseExamPayload) => returnExceptionWrapper(payload.external_id, purchaseExam)(student, payload)
    )(payload.exams)

    purchasedExams.forEach(exam => {
      if (exam.success === false) {
        isError = true
      }
    })
  }
  if (payload.extentions) {
    purchasedExtentions = await mapP(
      async (payload: PurchaseExtentionPayload) => returnExceptionWrapper(payload.external_id, purchaseExtention)(student, payload)
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
    throwSpecialException(result, 'attach-products.failed', 400, 'Failed to attach some or all products to the student')
  }
}
