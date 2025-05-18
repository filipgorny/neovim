import { findBookErratasForStudent } from '../book-erratas-repository'

export default async (user, id: string, query) => {
  const take = query.limit?.take || 20
  const page = query.limit?.page || 1

  return findBookErratasForStudent(user.id, id, take, page)
}
