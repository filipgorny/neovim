import { create } from './student-exam-completions-repository'

export const createStudentExamCompletion = async (student_exam, student_id) => (
  create({
    student_exam_id: student_exam.id,
    student_id,
    scores: student_exam.scores,
    scores_status: student_exam.scores_status,
  })
)
