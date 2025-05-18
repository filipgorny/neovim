import R from 'ramda'
import { findOneOrFail as fetchExam } from '../../exams/exam-repository'
import { findOneOrFail as fetchChapter } from '../book-chapter-repository'
import { AttachedExamTypeEnum } from '../../attached-exams/attached-exam-types'
import { fetchAttachedExamCount, removeAll } from '../../attached-exams/attached-exam-repository'
import { createAttachedExam } from '../../attached-exams/attached-exams-service'
import { customException, throwException } from '../../../../utils/error/error-factory'

const isExamMini = R.pipe(
  R.path(['type', 'type']),
  R.toLower,
  R.equals('mini')
)

const extractIdsFromChapter = chapterId => R.pipe(
  R.propOr({}, 'book'),
  R.juxt([
    R.prop('id'),
    R.pipe(
      R.propOr([], 'chapters'),
      R.pluck('id')
    ),
  ]),
  R.flatten,
  R.reject(
    R.equals(chapterId)
  )
)

export default async (chapterId: string, examId: string) => {
  const chapter = await fetchChapter({ id: chapterId }, ['book.chapters'])
  const attachedType = AttachedExamTypeEnum.chapter

  if (examId === null || examId === 'null') {
    return removeAll(attachedType, chapter.id, [])
  }

  const exam = await fetchExam({ id: examId }, ['type'])

  const ids: string[] = extractIdsFromChapter(chapter.id)(chapter)
  const count = await fetchAttachedExamCount(exam.id, ids)

  if (Number(count) > 0) {
    throwException(customException('exams.already-exists', 422, 'Exam is already attached within the book'))
  }

  await removeAll(attachedType, chapter.id, [])

  return createAttachedExam(attachedType, exam.id, chapter.id)
}
