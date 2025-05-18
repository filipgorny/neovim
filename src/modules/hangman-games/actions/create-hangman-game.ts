import { earnSaltyBucksForEndingHangmanGame } from '../../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../../types/student-course'
import HangmanGameDTO, { HangmanGame } from '../dto/hangman-game-dto'
import { create } from '../hangman-games-repository'

export default async (dto: HangmanGameDTO, student_id: string, studentCourse?: StudentCourse): Promise<HangmanGame> => {
  const result = await create({
    ...dto,
    student_id,
  })

  await earnSaltyBucksForEndingHangmanGame(student_id, result.get('id'), dto.score, studentCourse)

  return result
}
