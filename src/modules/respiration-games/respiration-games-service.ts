import * as R from 'ramda'
import { create } from './respiration-games-repository'
import { RespirationGameDTO } from '../../types/respiration-game'
import { earnSaltyBucksForEndingRespirationGame } from '../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../types/student-course'

export const createRespirationGameEntry = async (student_id: string, dto: RespirationGameDTO, studentCourse?: StudentCourse) => {
  // todo wrap all in transaction
  const earnedSaltyBucks = dto.score - dto.expenses

  const result = await create({
    student_id,
    ...R.omit(['expenses'])(dto),
    answers: JSON.stringify(dto.answers),
  })

  await earnSaltyBucksForEndingRespirationGame(student_id, result.id, earnedSaltyBucks, studentCourse)

  return result
}
