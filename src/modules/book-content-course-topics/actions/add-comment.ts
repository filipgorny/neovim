import { saveBookContentCourseTopicComment } from '../book-content-course-topics-service'

type Payload = {
  comment_raw: string,
  comment_html: string,
  comment_delta_object: object,
}

export default async (id: string, payload: Payload) => (
  saveBookContentCourseTopicComment(id, payload.comment_raw, payload.comment_html, payload.comment_delta_object)
)
