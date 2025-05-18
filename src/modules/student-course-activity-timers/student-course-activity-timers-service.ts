import { upsertAbstractActivityTimer } from '../../../services/activity-timers/activity-timers-service'
import { create, patch, findOne } from './student-course-activity-timers-repository'

type ActivityTimerPayload = {
  student_id: string,
  student_course_id: string,
}

export const upsertActivityTimer = async (payload: ActivityTimerPayload, seconds: number, trx) => {
  const timer = await findOne({
    student_id: payload.student_id,
    student_course_id: payload.student_course_id,
  })

  return upsertAbstractActivityTimer(create, patch)(payload, seconds, timer, trx)
}
