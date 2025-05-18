import * as R from 'ramda'
import { customException, throwException } from '@desmart/js-utils/dist/error'
import { int } from '@desmart/js-utils/dist/number'
import { findOneOrFail } from '../../student-book-chapters/student-book-chapter-repository'
import { calculateResetCost, getContentQuestionsFromChapter, rejectUnansweredQuestions } from '../../../../services/student-book-content-questions/calculate-reset-cost'
import { insufficientFundsException } from '../../../../utils/error/error-factory'
import { resetQuestionsByIds } from '../student-book-content-question-service'

const validateChapterBelongsToStudent = (studentId: string, chapter) => (
  R.pipe(
    R.path(['book', 'student_id']),
    R.unless(
      R.equals(studentId),
      () => throwException(customException('student-book-chapter.forbidden', 403, 'Chapter does not belong to student'))
    )
  )(chapter)
)

const validateStudentCanPay = (student, amountToPay) => {
  if (int(student.salty_bucks_balance) < int(amountToPay)) {
    throwException(insufficientFundsException())
  }
}

export default async (chapter_id: string, user) => {
  const chapter = await findOneOrFail({ id: chapter_id }, ['book', 'subchapters.contents.questions'])
  const cost = await calculateResetCost(chapter)
  const student = user.toJSON()

  validateChapterBelongsToStudent(student.id, chapter)
  validateStudentCanPay(student, cost.chapter_reset_cost)

  const questionsToReset = R.pipe(
    getContentQuestionsFromChapter,
    rejectUnansweredQuestions,
    R.pluck('id')
  )(chapter)

  if (R.isEmpty(questionsToReset)) {
    return
  }

  return resetQuestionsByIds(questionsToReset, student, chapter_id, cost.chapter_reset_cost)
}
