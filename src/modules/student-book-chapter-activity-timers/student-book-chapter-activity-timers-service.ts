import { create, patch, findOne, deleteAttachmentsByChapterId } from './student-book-chapter-activity-timers-repository'
import { upsertActivityTimer as upsertBookActivityTimer } from '../student-book-activity-timers/student-book-activity-timers-service'
import { upsertAbstractActivityTimer } from '../../../services/activity-timers/activity-timers-service'
import orm from '../../models'

type ActivityTimerPayload = {
  student_book_chapter_id: string,
  student_id: string,
  student_course_id: string,
  student_book_id: string,
  activity_date: string,
}

export const upsertActivityTimer = async (payload: ActivityTimerPayload, seconds: number) => {
  return orm.bookshelf.transaction(async trx => {
    const timer = await findOne({
      student_book_chapter_id: payload.student_book_chapter_id,
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

export const deleteByChapterId = async (content_id: string) => (
  deleteAttachmentsByChapterId(content_id)
)
