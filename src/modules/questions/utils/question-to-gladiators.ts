import * as R from 'ramda'
import { getGladiatorsGameApiClient } from '../../../../services/game-http-client/client'

export const createQuestionGladiators = async (request, payload) => {
  const res = await getGladiatorsGameApiClient(request)
    .post('/questions', {
      ...payload,
    })

  return R.prop('data', res)
}

export const updateQuestionGladiators = async (request, id: string, payload) => {
  const res = await getGladiatorsGameApiClient(request)
    .patch(`/questions/${id}`, {
      ...payload,
    })

  return R.prop('data', res)
}

export const deleteQuestionGladiators = async (request, id: string) => {
  const res = await getGladiatorsGameApiClient(request)
    .delete(`/questions/${id}`)

  return R.prop('data', res)
}
