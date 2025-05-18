import { find } from '../mcat-dates-repository'

export default async (query) => (
  find(query, query?.filter?.course_id ? { course_id: query.filter.course_id } : {})
)
