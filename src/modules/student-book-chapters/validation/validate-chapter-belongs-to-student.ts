import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOneOrFail as findChapter } from '../student-book-chapter-repository'

export const validateChapterBelongsToStudent = async (student_id: string, chapter_id: string) => {
  const chapter = await findChapter({ id: chapter_id }, ['book'])

  R.unless(
    R.pathSatisfies(
      R.equals(student_id),
      ['book', 'student_id']
    ),
    () => throwException(
      customException('student-book-chapter.forbidden', 403, 'Chapter does not belong to student')
    )
  )(chapter)
}
