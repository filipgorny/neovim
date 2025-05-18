import { find } from '../exam-erratas-repository'

export default async (exam_id: string, query) => (
  find(query, {
    exam_id,
  })
)
