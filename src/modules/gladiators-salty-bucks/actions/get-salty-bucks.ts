import * as R from 'ramda'
import { findOneOrFail } from '../../students/student-repository'

export const getBalanceFromStudent = R.propOr(0, 'salty_bucks_balance')

export default async (id: string) => {
  const student = await findOneOrFail({ id })

  return {
    student_id: id,
    salty_bucks: getBalanceFromStudent(student),
  }
}
