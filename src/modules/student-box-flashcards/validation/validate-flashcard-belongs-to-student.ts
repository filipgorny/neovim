import * as R from 'ramda'
import { customException, throwException } from '@desmart/js-utils'
import { findOneOrFail as findStudentFlashcard } from '../../student-book-content-flashcards/student-book-content-flashcard-repository'

export const validateFlashcardBelongsToStudent = async (student_flashcard_id: string, student_id: string) => {
  const flashcard = await findStudentFlashcard({
    id: student_flashcard_id,
  }, ['content.subchapter.chapter.book'])

  R.pipe(
    R.path(['content', 'subchapter', 'chapter', 'book', 'student_id']),
    R.unless(
      R.equals(student_id),
      () => throwException(customException('student-flashcards.user-mismatch', 403, 'Flashcard does not belong to student'))
    )
  )(flashcard)
}
