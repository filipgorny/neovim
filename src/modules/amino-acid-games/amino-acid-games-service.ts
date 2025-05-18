import * as R from 'ramda'
import { create } from './amino-acid-games-repository'
import { AminoAcidGameDTO } from '../../types/amino-acid-game'
import { earnSaltyBucksForEndingAminoAcidGame } from '../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../types/student-course'

export const createAminoAcidGameEntry = async (student_id: string, dto: AminoAcidGameDTO, studentCourse?: StudentCourse) => {
  // todo wrap all in transaction
  const earnedSaltyBucks = dto.score - dto.expenses

  const result = await create({
    student_id,
    ...R.omit(['expenses'])(dto),
    answers: JSON.stringify(dto.answers),
  })

  await earnSaltyBucksForEndingAminoAcidGame(student_id, result.id, earnedSaltyBucks, studentCourse)

  return result
}
