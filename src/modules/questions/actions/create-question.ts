import * as R from 'ramda'
import { QuestionType } from '../question-types'
import { create } from '../question-repository'
import { makeDTO } from '../dto/question-dto'
import { createQuestionGladiators } from '../utils/question-to-gladiators'

export interface CreateQuestionPayload {
  question_content_raw: string,
  question_content_delta_object: any,
  explanation_raw: string,
  explanation_delta_object: any,
  answer_definition: Record<string, { raw: string, delta_object: any }>,
  type: QuestionType,
  correct_answers: string[]
}

export default async (request, userInstance, payload: CreateQuestionPayload) => {
  const user = userInstance.toJSON()

  if (R.prop('type', payload) === QuestionType.GladiatorsQuestion) {
    return createQuestionGladiators(request, payload)
  }

  return create(
    makeDTO(
      payload.question_content_raw,
      JSON.stringify(payload.question_content_delta_object),
      JSON.stringify(payload.answer_definition),
      payload.explanation_raw,
      JSON.stringify(payload.explanation_delta_object),
      payload.type,
      JSON.stringify(payload.correct_answers)
    )
  )
}
