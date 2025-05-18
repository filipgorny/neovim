import { find } from '../course-map-repository'

export default async (id: string, query) => (
  find(query, { book_course_id: id })
)
