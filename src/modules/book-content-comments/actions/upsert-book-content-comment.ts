import { upsertComment } from '../book-content-comments-service'

type Payload = {
  comment_raw: string,
  comment_html: string,
  comment_delta_object: {},
}

export default async (course_id: string, book_content_id: string, payload: Payload) => (
  upsertComment({ course_id, book_content_id, ...payload })
)
