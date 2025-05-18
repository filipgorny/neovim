import moment from 'moment'
import { DATE_FORMAT_YMD } from '../../constants'
import { findOne as findContentAmount, patch, create } from './student-book-contents-read-repository'

export const upsertAmountContentRead = async (student_id: string, student_course_id: string, student_book_id: string, amount_read: number) => {
  const today = moment().format(DATE_FORMAT_YMD)

  const contentAmount = await findContentAmount({
    student_book_id,
    student_course_id,
    student_id,
    updated_at: today,
  })

  return contentAmount
    ? patch(contentAmount.id, { content_read_amount: contentAmount.content_read_amount + amount_read })
    : create({
      student_book_id,
      student_course_id,
      student_id,
      content_read_amount: amount_read,
    })
}
