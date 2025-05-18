import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOneOrFail as findContent } from '../../student-book-contents/student-book-content-repository'
import { setBookmark } from '../student-book-chapter-service'
import { validateChapterBelongsToStudent } from '../validation/validate-chapter-belongs-to-student'

type Payload = {
  student_book_content_id: string,
}

const validateContentBelongsToChapter = async (content_id: string, chapter_id: string) => {
  const content = await findContent({ id: content_id }, ['subchapter'])

  R.unless(
    R.pathSatisfies(
      R.equals(chapter_id),
      ['subchapter', 'chapter_id']
    ),
    () => throwException(
      customException('student-book-content.forbidden', 403, 'Book content does not belong to chapter')
    )
  )(content)
}

export default async (user, id: string, payload: Payload) => {
  await validateChapterBelongsToStudent(user.id, id)
  await validateContentBelongsToChapter(payload.student_book_content_id, id)

  return setBookmark(id, payload.student_book_content_id)
}
