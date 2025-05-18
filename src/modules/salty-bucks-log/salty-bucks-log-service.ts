import { create } from './salty-bucks-log-repository'
import { SaltyBucksOperationSubtype } from './salty-bucks-operation-subtype'
import { SaltyBucksOperationType } from './salty-bucks-operation-type'
import { SaltyBucksReferenceType } from './salty-bucks-reference-type'
import { SaltyBucksSource } from './salty-bucks-source'

export const logIncome = async (
  student_id: string,
  amount: number,
  operation_subtype: SaltyBucksOperationSubtype,
  reference_id: string,
  reference_type = SaltyBucksReferenceType.resource,
  source = SaltyBucksSource.platform,
  metadata?: object
) => (
  create({
    student_id,
    amount,
    operation_subtype,
    operation_type: SaltyBucksOperationType.income,
    metadata,
    source,
    reference_id,
    reference_type,
  })
)

export const logOutcome = async (
  student_id: string,
  amount: number,
  operation_subtype: SaltyBucksOperationSubtype,
  reference_id: string,
  reference_type = SaltyBucksReferenceType.resource,
  source = SaltyBucksSource.platform,
  metadata?: object
) => (
  create({
    student_id,
    amount,
    operation_subtype,
    operation_type: SaltyBucksOperationType.outcome,
    metadata,
    source,
    reference_id,
    reference_type,
  })
)
