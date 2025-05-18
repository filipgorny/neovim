import { SaltyBucksEarningsModes } from '../../dashboard/salty-bucks-earnings-modes'
import { findOneInstance as findStudent } from '../student-repository'
import saltyBucksGraphAction from '../../dashboard/actions/salty-bucks-earnings'
import { customException, throwException } from '@desmart/js-utils'

export default async (id: string, query, mode: string) => {
  const student = await findStudent({ id })

  if (!(Object.values(SaltyBucksEarningsModes) as string[]).includes(mode)) {
    throwException(customException('dashboard.salty-bucks-earnings.invalid-mode', 404, 'Invalid salty bucks earnings mode'))
  }

  return saltyBucksGraphAction(student, query, mode as SaltyBucksEarningsModes)
}
