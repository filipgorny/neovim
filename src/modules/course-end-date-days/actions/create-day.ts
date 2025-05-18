import * as R from 'ramda'
import { createEntity } from '../course_end_date_days-service'

export default async (payload) => (
  createEntity({
    ...payload,
    ...(payload.class_topic ? { class_topic: payload.class_topic } : {}),
    ...(payload.class_topic_number ? { class_topic_number: payload.class_topic_number } : {}),
    ...(payload.meeting_url ? { meeting_url: payload.meeting_url } : {}),
    ...((payload.book_chapter_id && !R.isEmpty(payload.book_chapter_id)) ? { book_chapter_id: payload.book_chapter_id } : { book_chapter_id: null }),
    ...((payload.exam_id && !R.isEmpty(payload.exam_id)) ? { exam_id: payload.exam_id } : { exam_id: null }),
    ...(payload.custom_title ? { custom_title: payload.custom_title } : {}),
    ...(payload.fill_colour_start ? { fill_colour_start: payload.fill_colour_start } : {}),
    ...(payload.fill_colour_stop ? { fill_colour_stop: payload.fill_colour_stop } : {}),
    ...(payload.font_colour ? { font_colour: payload.font_colour } : {}),
    ...(payload.course_tutor_id ? { course_tutor_id: payload.course_tutor_id } : {}),
  })
)
