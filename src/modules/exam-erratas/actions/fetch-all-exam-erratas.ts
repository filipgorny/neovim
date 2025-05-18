import { fetchAllStudentExamErratas } from '../exam-erratas-repository'

export default async (student, query) => {
  const take = query.limit?.take || 20
  const page = query.limit?.page || 1

  return fetchAllStudentExamErratas(student.id, take, page)
}
