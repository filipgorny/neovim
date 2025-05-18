import { find } from '../book-content-course-topics-repository'

export default async (course_id: string, book_content_id: string) => (
  find({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, { course_id, book_content_id }, ['courseTopic'])
)
