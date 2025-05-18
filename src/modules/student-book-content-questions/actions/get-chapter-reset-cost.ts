import * as R from 'ramda'
import { customException, throwException } from '@desmart/js-utils/dist/error'
import { findOneOrFail } from '../../student-book-chapters/student-book-chapter-repository'
import { calculateResetCost } from '../../../../services/student-book-content-questions/calculate-reset-cost'

const validateChapterBelongsToStudent = (studentId: string, chapter) => (
  R.pipe(
    R.path(['book', 'student_id']),
    R.unless(
      R.equals(studentId),
      () => throwException(customException('student-book-chapter.forbidden', 403, 'Chapter does not belong to student'))
    )
  )(chapter)
)

export default async (chapter_id: string, user) => {
  const chapter = await findOneOrFail({ id: chapter_id }, ['book', 'subchapters.contents.questions'])

  validateChapterBelongsToStudent(user.id, chapter)

  return calculateResetCost(chapter)
}
