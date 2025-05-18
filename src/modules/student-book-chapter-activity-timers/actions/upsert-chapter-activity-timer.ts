import * as R from 'ramda'
import { findOneOrFail as findChapter } from '../../student-book-chapters/student-book-chapter-repository'
import { DATE_FORMAT_YMD, PREVIEW_STUDENT_EMAIL } from '../../../constants'
import { StudentCourse } from '../../../types/student-course'
import { upsertActivityTimer as upsertChapterActivityTimer } from '../student-book-chapter-activity-timers-service'
import moment from 'moment'

type Payload = {
  seconds: number
}

const isStudentPreview = user => (
  user.get('email') === PREVIEW_STUDENT_EMAIL
)

const getStudentBook = async (chapter_id: string) => (
  R.pipeWith(R.andThen)([
    async chapter_id => findChapter({ id: chapter_id }, ['book']),
    R.prop('book'),
  ])(chapter_id)
)

export default async (user, chapter_id: string, studentCourse: StudentCourse, payload: Payload) => {
  if (isStudentPreview(user)) {
    return true
  }

  const book = await getStudentBook(chapter_id)

  return await upsertChapterActivityTimer({
    student_book_chapter_id: chapter_id,
    student_id: user.id,
    student_course_id: studentCourse.id,
    student_book_id: book.id,
    activity_date: moment().format(DATE_FORMAT_YMD),
  }, payload.seconds)
}
