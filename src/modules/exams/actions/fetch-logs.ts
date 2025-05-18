import { find } from '../../exam-logs/exam-logs-repository'

export default async (id: string, query) => (
  find({
    limit: query.limit,
    order: {
      by: 'created_at',
      dir: 'desc'
    }
  }, { exam_id: id }, ['admin'])
)
