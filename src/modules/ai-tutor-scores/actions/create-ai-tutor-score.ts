import { StudentCourse } from '../../../types/student-course'
import { createAiTutorScore } from '../ai-tutor-scores-service'

type Payload = {
  score: number,
  student_book_chapter_id: string,
}

export default async (studentCourse: StudentCourse, payload: Payload) => (
  createAiTutorScore(studentCourse, payload.student_book_chapter_id, payload.score)
)
