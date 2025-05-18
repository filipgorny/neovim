import R from 'ramda'
import { findSaltyBucksLogs } from '../../salty-bucks-log/salty-bucks-log-repository'
import { checkIfActiveStudentExist } from '../student-repository'
import { notFoundException } from '../../../../utils/error/error-factory'

interface Command {
  studentId: string
  limit: Record<string, unknown>
  order: Record<string, unknown>
}

const validateIfSpecificStudentExists = async (command: Command) => {
  const studentExist = await checkIfActiveStudentExist({ id: command.studentId })

  if (!studentExist) {
    throw notFoundException('Student')
  }

  return command
}

export default async (studentId: string, query: any) => R.pipeWith(R.andThen)([
  validateIfSpecificStudentExists,
  findSaltyBucksLogs,
])({ studentId, limit: query.limit, order: query.order })
