import { QuestionType } from '../question-types'

export type QuestionDto = {
  question_content_raw: string,
  question_content_delta_object: string,
  answer_definition: string,
  explanation_raw: string,
  explanation_delta_object: string,
  type: QuestionType,
  correct_answers: string,
}

export const makeDTO = (
  question_content_raw: string,
  question_content_delta_object: string,
  answer_definition: string,
  explanation_raw: string,
  explanation_delta_object: string,
  type: QuestionType,
  correct_answers: string
): QuestionDto => ({
  question_content_raw,
  question_content_delta_object,
  answer_definition,
  explanation_raw,
  explanation_delta_object,
  type,
  correct_answers,
})

export default QuestionDto
