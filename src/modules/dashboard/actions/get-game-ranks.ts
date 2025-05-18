import { StudentCourse } from '../../../types/student-course'
import { getAminoAcidStudentRank } from '../../amino-acid-games/amino-acid-games-repository'
import { getHangmanStudentRank } from '../../hangman-games/hangman-games-repository'
import { getRespirationStudentRank } from '../../respiration-games/respiration-games-repository'
import { getBookVideosWatchedPercentage } from '../../student-videos/student-videos-repository'

export default async (student, studentCourse: StudentCourse) => {
  const [amino_acid_rank, hangman_rank, respiration_rank] = await Promise.all([
    getAminoAcidStudentRank(student),
    getHangmanStudentRank(student),
    getRespirationStudentRank(student),
  ])

  return {
    amino_acid_rank,
    hangman_rank,
    respiration_rank,
  }
}
