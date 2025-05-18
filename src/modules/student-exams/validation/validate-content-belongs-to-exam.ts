import R from 'ramda'
import { CONTENT_TYPE_PASSAGE, CONTENT_TYPE_ANSWERS, CONTENT_TYPE_QUESTION } from '../changable-content-types'
import { findOneOrFail as findQuestion } from '../../student-exam-questions/student-exam-question-repository'
import { findOneOrFail as findPassage } from '../../student-exam-passages/student-exam-passage-repository'
import {
  throwException,
  questionDoesNotBelongToExamException,
  passageDoesNotBelongToExamException
} from '../../../../utils/error/error-factory'

const validateQuestion = (examId, questionId) => async () => {
  const question = await findQuestion({ id: questionId }, ['passage.section.exam'])

  R.pipe(
    R.path(['passage', 'section', 'exam', 'id']),
    R.unless(
      R.equals(examId),
      () => throwException(questionDoesNotBelongToExamException())
    )
  )(question)
}

const validatePassage = (examId, passageId) => async () => {
  const passage = await findPassage({ id: passageId }, ['section.exam'])

  R.pipe(
    R.path(['section', 'exam', 'id']),
    R.unless(
      R.equals(examId),
      () => throwException(passageDoesNotBelongToExamException())
    )
  )(passage)
}

export const validateContentBelongsToExam = (examId, resourceId) => async contentType => (
  R.cond([
    [R.equals(CONTENT_TYPE_QUESTION), validateQuestion(examId, resourceId)],
    [R.equals(CONTENT_TYPE_ANSWERS), validateQuestion(examId, resourceId)],
    [R.equals(CONTENT_TYPE_PASSAGE), validatePassage(examId, resourceId)]
  ])(contentType)
)
