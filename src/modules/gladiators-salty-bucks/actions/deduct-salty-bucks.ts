import { int } from '@desmart/js-utils'
import { deductSaltyBucksForGladiatorsGame } from '../../../../services/salty-bucks/salty-buck-service'
import { getBalanceFromStudent } from './get-salty-bucks'
import { findOneOrFail } from '../../students/student-repository'
import { SaltyBucksPayload } from '../types/gladiators-salty-bucks-payload'
import { SaltyBucksOperationSubtype } from '../../salty-bucks-log/salty-bucks-operation-subtype'

export default async (payload: SaltyBucksPayload) => {
  const { student_id, amount } = payload
  const operation_subtype: SaltyBucksOperationSubtype = Object.values(SaltyBucksOperationSubtype).find(value => value === `gladiators_${payload.operation_subtype}`)
  const student = await findOneOrFail({ id: student_id })
  await deductSaltyBucksForGladiatorsGame(student_id, operation_subtype, int(amount))

  return {
    student_id: student_id,
    salty_bucks: getBalanceFromStudent(student) - amount,
  }
}
