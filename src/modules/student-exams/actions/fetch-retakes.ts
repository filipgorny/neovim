import { getCompletionsForStudentExam } from '../../student-exam-completions/student-exam-completions-repository'

export default async (id: string) => (
  getCompletionsForStudentExam(id)
)
