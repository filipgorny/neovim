import { AminoAcidGameDTO } from '../../../types/amino-acid-game'
import { StudentCourse } from '../../../types/student-course'
import { createAminoAcidGameEntry } from '../amino-acid-games-service'

export default async (student, payload: AminoAcidGameDTO, studentCourse?: StudentCourse) => (
  createAminoAcidGameEntry(student.id, payload, studentCourse)
)
