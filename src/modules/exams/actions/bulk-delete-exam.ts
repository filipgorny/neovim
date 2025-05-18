import { customException, throwException } from '../../../../utils/error/error-factory'
import { deleteExam } from '../exam-service'
import mapP from '../../../../utils/function/mapp'
import { findOne } from '../exam-repository'

type Payload = {
  ids: string[]
}

const throwWhenIdsNotDefined = () => throwException(customException('', 422, ''))

const processExamDelete = async (id, userId) => {
  const exam = await findOne({ id })

  if (!exam || exam.deleted_at) return

  return deleteExam(exam.id, exam.title, exam.external_id, userId)
}

export default async (user, payload: Payload) => {
  if (!payload.ids) throwWhenIdsNotDefined()

  await mapP(
    async id => processExamDelete(id, user.id)
  )(payload.ids)

  return true
}
