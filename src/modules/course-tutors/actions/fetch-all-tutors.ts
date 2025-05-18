import { find } from '../course-tutors-repository'

export default async (course_id: string, query) => {
  const filter = query.filter || {}

  return find(query, { course_id, deleted_at: null, ...filter })
}
