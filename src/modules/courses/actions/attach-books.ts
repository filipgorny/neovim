import R from 'ramda'
import { findOneOrFail as fetchCourse } from '../course-repository'
import { findBooksWithIds } from '../../books/book-repository'
import { removeAll, create } from '../../course-books/course-book-repository'
import { findExamsWithIds } from '../../exams/exam-repository'
import orm from '../../../models'
import mapP from '../../../../utils/function/mapp'

const bookshelf = orm.bookshelf

const isFreeTrialBook = freeTrials => bookId => R.pipe(
  R.find(
    R.propEq('freeTrialBook', bookId)
  ),
  R.isNil,
  R.not
)(freeTrials)

const findFreeTrialExam = (freeTrials, examIds) => bookId => R.pipe(
  R.find(
    R.propEq('freeTrialBook', bookId)
  ),
  R.propOr(null, 'freeTrialExam'),
  R.when(
    value => !examIds.includes(value),
    R.always(null)
  )
)(freeTrials)

const prepareCourseBooks = (courseId, books, examIds, freeTrials) => R.pipe(
  R.pluck('id'),
  R.map(
    R.applySpec({
      book_id: R.identity,
      course_id: R.always(courseId),
      is_free_trial: isFreeTrialBook(freeTrials),
      free_trial_exam_id: findFreeTrialExam(freeTrials, examIds),
    })
  )
)(books)

export default async (id: string, payload) => {
  const { books, freeTrials } = payload
  const course = await fetchCourse({ id })
  const freeTrialExams = R.pluck('freeTrialExam')(freeTrials)
  const existingBooks = await findBooksWithIds('id', books)
  const existingExams = await findExamsWithIds('id', freeTrialExams)
  const examIds = R.pluck('id')(existingExams)
  const courseBooksToInsert = prepareCourseBooks(course.id, existingBooks, examIds, freeTrials)

  return bookshelf.transaction(async trx => {
    await removeAll(course.id, [], trx)

    return mapP(
      async dto => create(dto, trx)
    )(courseBooksToInsert)
  })
}
