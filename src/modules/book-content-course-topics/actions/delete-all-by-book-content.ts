import { deleteByBookContent as deleteContentTopics } from '../book-content-course-topics-service'
import { deleteByBookContent as deleteComments } from '../../book-content-comments/book-content-comments-service'

export default async (course_id: string, book_content_id: string) => (
  Promise.all([
    deleteContentTopics(course_id, book_content_id),
    deleteComments(course_id, book_content_id),
  ])
)
