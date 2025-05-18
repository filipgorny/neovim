import { findBookErratasForAdmin } from '../book-erratas-repository'

export default async (id: string, query) => {
  const take = query.limit?.take || 20
  const page = query.limit?.page || 1

  return findBookErratasForAdmin(id, take, page)
}
