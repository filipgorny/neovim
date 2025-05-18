import * as R from 'ramda'
import { notFoundException, throwException } from '@desmart/js-utils'
import { findOneOrFail as findChapter } from '../../student-book-chapters/student-book-chapter-repository'
import { find as findHistory } from '../../chat-history/chat-history-repository'
import { getChapterContextId } from '../../chat-history/chat-history-service'

const validateBookBelongsToStudent = studentId => R.pipe(
  R.path(['book', 'student_id']),
  R.unless(
    R.equals(studentId),
    () => throwException(notFoundException('StudentBook'))
  )
)

export default async (user, student_book_chapter_id: string, query = { new_context: '' }) => {
  const student = user.toJSON()
  const chapter = await findChapter({ id: student_book_chapter_id }, ['book'])

  validateBookBelongsToStudent(student.id)(chapter)

  const contextId = await getChapterContextId(chapter, query.new_context === 'true')

  const history = await findHistory({ limit: { page: 1, take: 100 }, order: { by: 'created_at', dir: 'asc' } }, { student_id: student.id, student_book_chapter_id: chapter.id, context_id: contextId })

  return history
}
