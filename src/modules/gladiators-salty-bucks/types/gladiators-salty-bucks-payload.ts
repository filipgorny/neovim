import { GladiatorsSaltyBucksOperationSubtype } from './gladiators-salty-bucks-operation-subtype'

export type SaltyBucksPayload = {
  student_id: string,
  amount: number,
  operation_subtype: GladiatorsSaltyBucksOperationSubtype,
}
