import { StudentCourse } from '../../../types/student-course'
import { fetchChapterProgress } from '../ai-tutor-scores-service'

export default async (studentCourse: StudentCourse) => (
  fetchChapterProgress(studentCourse)
)
