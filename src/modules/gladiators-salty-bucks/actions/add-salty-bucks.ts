import { int } from '@desmart/js-utils'
import { earnSaltyBucksForGladiatorsGame } from '../../../../services/salty-bucks/salty-buck-service'
import { getBalanceFromStudent } from './get-salty-bucks'
import { findOneOrFail as findStudent } from '../../students/student-repository'
import { SaltyBucksOperationSubtype } from '../../salty-bucks-log/salty-bucks-operation-subtype'
import { SaltyBucksPayload } from '../types/gladiators-salty-bucks-payload'

export default async (payload: SaltyBucksPayload) => {
  const { student_id, amount } = payload
  const operation_subtype: SaltyBucksOperationSubtype = Object.values(SaltyBucksOperationSubtype).find(value => value === `gladiators_${payload.operation_subtype}`)
  const student = await findStudent({ id: student_id })
  await earnSaltyBucksForGladiatorsGame(student_id, operation_subtype, int(amount))

  return {
    student_id: student_id,
    salty_bucks: getBalanceFromStudent(student) + amount,
  }
}
