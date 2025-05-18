import R from 'ramda'
import { countActiveStudentsByIds, softDeleteByIds } from '../student-repository'
import { notFoundException } from '../../../../utils/error/error-factory'

interface Payload {
  ids: string[]
}

const checkIfAllSpecifiedStudentsAreActive = async (payload: Payload) => {
  const studentsCount = await countActiveStudentsByIds({ ids: payload.ids })

  if (studentsCount !== payload.ids.length) {
    throw notFoundException('Student')
  }

  return payload
}

const softDeleteStudents = async (payload: Payload) => {
  const result = await softDeleteByIds({ ids: payload.ids })

  if (!result) {
    throw notFoundException('Student')
  }

  return result
}

export default async (payload: Payload) => {
  return R.pipeWith(R.andThen)([
    checkIfAllSpecifiedStudentsAreActive,
    softDeleteStudents,
  ])(payload)
}
