import { create, patch, findOne } from './video-activity-timers-repository'
import { upsertActivityTimer as upsertBookActivityTimer } from '../student-book-activity-timers/student-book-activity-timers-service'
import { upsertAbstractActivityTimer } from '../../../services/activity-timers/activity-timers-service'
import orm from '../../models'

type ActivityTimerPayload = {
  video_id: string,
  student_id: string,
  student_course_id: string,
  student_book_id: string,
  activity_date: string,
}

export const upsertActivityTimer = async (payload: ActivityTimerPayload, seconds: number) => {
  return orm.bookshelf.transaction(async trx => {
    const timer = await findOne({
      video_id: payload.video_id,
      student_id: payload.student_id,
      student_course_id: payload.student_course_id,
      student_book_id: payload.student_book_id,
      activity_date: payload.activity_date,
    })

    const result = upsertAbstractActivityTimer(create, patch)(payload, seconds, timer, trx)

    await await upsertBookActivityTimer({
      student_id: payload.student_id,
      student_course_id: payload.student_course_id,
      student_book_id: payload.student_book_id,
    }, seconds, trx)

    return result
  })
}
