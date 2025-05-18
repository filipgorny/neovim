import { dropStudentExams } from '../student-exam-service'

export default async (studentExamId: string) => (
  dropStudentExams([studentExamId])
)
