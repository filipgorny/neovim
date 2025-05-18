import * as R from 'ramda'
import { CreateQuestionPayload } from './create-question'
import { updateActiveQuestionById } from '../question-repository'
import { notFoundExceptionWithID } from '../../../../utils/error/error-factory'
import { QuestionType } from '../question-types'
import { updateQuestionGladiators } from '../utils/question-to-gladiators'

type UpdateQuestionPayload = Partial<CreateQuestionPayload>

export default async (request, id: string, payload: UpdateQuestionPayload) => {
  if (R.prop('type', payload) === QuestionType.GladiatorsQuestion) {
    return updateQuestionGladiators(request, id, payload)
  }

  const updateModel = payload as any

  if (updateModel.question_content_delta_object) {
    updateModel.question_content_delta_object = JSON.stringify(updateModel.question_content_delta_object)
  }

  if (updateModel.answer_definition) {
    updateModel.answer_definition = JSON.stringify(updateModel.answer_definition)
  }

  if (updateModel.explanation_delta_object) {
    updateModel.explanation_delta_object = JSON.stringify(updateModel.explanation_delta_object)
  }

  if (updateModel.correct_answers) {
    updateModel.correct_answers = JSON.stringify(updateModel.correct_answers)
  }

  const result = await updateActiveQuestionById({ id, data: payload })

  if (!result) {
    throw notFoundExceptionWithID('Question', id)
  }

  return result
}
