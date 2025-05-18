import * as R from 'ramda'
import { findOneOrFail as findFlashcard } from '../../student-book-content-flashcards/student-book-content-flashcard-repository'
import { DATE_FORMAT_YMD, PREVIEW_STUDENT_EMAIL } from '../../../constants'
import { StudentCourse } from '../../../types/student-course'
import { upsertActivityTimer as upsertFlashcardActivityTimer } from '../flashcard-activity-timers-service'
import moment from 'moment'

type Payload = {
  seconds: number
}

const isStudentPreview = user => (
  user.get('email') === PREVIEW_STUDENT_EMAIL
)

const getStudentBook = async (flashcard_id: string) => (
  R.pipeWith(R.andThen)([
    async flashcard_id => findFlashcard({ id: flashcard_id }, ['content.subchapter.chapter.book']),
    R.path(['content', 'subchapter', 'chapter', 'book']),
  ])(flashcard_id)
)

export default async (user, flashcard_id: string, studentCourse: StudentCourse, payload: Payload) => {
  if (isStudentPreview(user)) {
    return true
  }

  const book = await getStudentBook(flashcard_id)

  return await upsertFlashcardActivityTimer({
    flashcard_id: flashcard_id,
    student_id: user.id,
    student_course_id: studentCourse.id,
    student_book_id: book.id,
    activity_date: moment().format(DATE_FORMAT_YMD),
  }, payload.seconds)
}
