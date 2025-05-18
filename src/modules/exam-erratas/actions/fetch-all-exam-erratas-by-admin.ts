import { fetchAllExamErratas } from '../exam-erratas-repository'

export default async (query) => {
  const take = query.limit?.take || 20
  const page = query.limit?.page || 1
  const by = query.order?.by || 'created_at'
  const dir = query.order?.dir || 'desc'

  return fetchAllExamErratas({ take, page }, { by, dir })
}
