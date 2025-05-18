import R from 'ramda'
import { findOneOrFail as fetchExam } from '../../exams/exam-repository'
import { findOneOrFail as fetchBook } from '../book-repository'
import { AttachedExamTypeEnum } from '../../attached-exams/attached-exam-types'
import { fetchAttachedExamCount, removeAll } from '../../attached-exams/attached-exam-repository'
import { createAttachedExam } from '../../attached-exams/attached-exams-service'
import { customException, throwException } from '../../../../utils/error/error-factory'

type Payload = {
  is_free_trial: boolean,
}

const extractIdsFromBook = bookId => R.pipe(
  R.juxt([
    R.prop('id'),
    R.pipe(
      R.propOr([], 'chapters'),
      R.pluck('id')
    ),
  ]),
  R.flatten,
  R.reject(
    R.equals(bookId)
  )
)

export default async (bookId: string, examId: string, payload: Payload) => {
  const book = await fetchBook({ id: bookId }, ['chapters'])
  const attachedType = AttachedExamTypeEnum.book

  if (examId === null || examId === 'null') {
    return removeAll(attachedType, book.id, [])
  }

  const exam = await fetchExam({ id: examId }, ['type'])

  const ids: string[] = extractIdsFromBook(book.id)(book)
  const count = await fetchAttachedExamCount(exam.id, ids)

  if (Number(count) > 0) {
    throwException(customException('exams.already-exists', 422, 'Exam is already attached within the book'))
  }

  await removeAll(attachedType, book.id, [])

  return createAttachedExam(attachedType, exam.id, book.id, payload.is_free_trial)
}
