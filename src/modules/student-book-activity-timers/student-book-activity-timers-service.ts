import { create, patch, findOne } from './student-book-activity-timers-repository'
import { upsertActivityTimer as upsertCourseActivityTimer } from '../student-course-activity-timers/student-course-activity-timers-service'
import { upsertAbstractActivityTimer } from '../../../services/activity-timers/activity-timers-service'

type ActivityTimerPayload = {
  student_id: string,
  student_course_id: string,
  student_book_id: string,
}

export const upsertActivityTimer = async (payload: ActivityTimerPayload, seconds: number, trx) => {
  const timer = await findOne({
    student_id: payload.student_id,
    student_course_id: payload.student_course_id,
    student_book_id: payload.student_book_id,
  })

  const result = upsertAbstractActivityTimer(create, patch)(payload, seconds, timer, trx)

  await await upsertCourseActivityTimer({
    student_id: payload.student_id,
    student_course_id: payload.student_course_id,
  }, seconds, trx)

  return result
}
