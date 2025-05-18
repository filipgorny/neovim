import R from 'ramda'
import { findOneOrFail } from '../student-exam-repository'
import { validateContentBelongsToExam } from '../validation/validate-content-belongs-to-exam'
import { CONTENT_TYPE_ANSWERS, CONTENT_TYPE_PASSAGE, CONTENT_TYPE_QUESTION } from '../changable-content-types'
import { changePassageContent } from '../../student-exam-passages/student-exam-passage-service'
import {
  changeAnswerDefinition,
  changeQuestionContent
} from '../../student-exam-questions/student-exam-question-service'

const updateQuestion = (questionId, content) => async () => (
  changeQuestionContent(questionId, content)
)

const updateAnswers = (questionId, content) => async () => (
  changeAnswerDefinition(questionId, content)
)

const updatePassage = (passageId, content) => async () => (
  changePassageContent(passageId, content)
)

const updateResource = (resourceId, content) => async contentType => (
  R.cond([
    [R.equals(CONTENT_TYPE_QUESTION), updateQuestion(resourceId, content)],
    [R.equals(CONTENT_TYPE_ANSWERS), updateAnswers(resourceId, content)],
    [R.equals(CONTENT_TYPE_PASSAGE), updatePassage(resourceId, content)],
  ])(contentType)
)

export default async (student, id, payload) => {
  const exam = await findOneOrFail({ id })

  const {
    content_type,
    content,
    resource_id,
  } = payload

  await validateContentBelongsToExam(exam.id, resource_id)(content_type)
  await updateResource(resource_id, content)(content_type)

  return true
}
