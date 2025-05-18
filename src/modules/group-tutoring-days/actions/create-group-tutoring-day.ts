import { createEntity } from '../group-tutoring-days-service'

export type Payload = {
  class_time: string
  class_time_end: string
  course_id: string
  class_date: string
  class_topic?: string | null
  class_topic_number?: string | null
  meeting_url?: string | null
  course_tutor_id?: string | null
}

export default async (payload: Payload) => (
  createEntity({
    ...payload,
    ...(payload.class_topic ? { class_topic: payload.class_topic } : {}),
    ...(payload.class_topic_number ? { class_topic_number: payload.class_topic_number } : {}),
    ...(payload.meeting_url ? { meeting_url: payload.meeting_url } : {}),
    ...(payload.course_tutor_id ? { course_tutor_id: payload.course_tutor_id } : {}),
  })
)
