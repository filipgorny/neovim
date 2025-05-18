import { createErrata } from '../exam-erratas-service'

type Payload = {
  exam_id: string,
  content_delta_object: {},
  content_raw: string,
  content_html: string
}

export default async (user, payload: Payload) => (
  createErrata({
    ...payload,
    created_by: user.id,
    content_delta_object: JSON.stringify(payload.content_delta_object),
    content_html: payload.content_html,
    content_raw: payload.content_raw,
  })
)
