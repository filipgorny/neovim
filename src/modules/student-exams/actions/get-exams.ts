import { findExamsForAllStudents } from '../../student-exams/student-exam-repository'

export default async (query) => (
  findExamsForAllStudents(query, query.filter)
)
