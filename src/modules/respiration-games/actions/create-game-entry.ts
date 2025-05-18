import { RespirationGameDTO } from '../../../types/respiration-game'
import { StudentCourse } from '../../../types/student-course'
import { createRespirationGameEntry } from '../respiration-games-service'

export default async (student, payload: RespirationGameDTO, studentCourse?: StudentCourse) => (
  createRespirationGameEntry(student.id, payload, studentCourse)
)
