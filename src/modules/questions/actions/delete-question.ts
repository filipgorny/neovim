import { softDeleteActiveQuestionById } from '../question-repository'
import { notFoundExceptionWithID } from '../../../../utils/error/error-factory'
import { deleteQuestionGladiators } from '../utils/question-to-gladiators'
import { QuestionType } from '../question-types'

export default async (request, id: string, query, trx?) => {
  if (query.type === QuestionType.GladiatorsQuestion) {
    return deleteQuestionGladiators(request, id)
  }

  const result = await softDeleteActiveQuestionById({ id }, trx)

  if (!result) {
    throw notFoundExceptionWithID('Question', id)
  }

  return result
}
