import { patchEntity } from '../course_end_date_days-service'

export default async (id: string, payload) => (
  patchEntity(id, {
    ...payload,
    ...(payload.class_topic ? { class_topic: payload.class_topic } : payload.class_topic === undefined ? {} : { class_topic: null }),
    ...(payload.class_topic_number ? { class_topic_number: payload.class_topic_number } : payload.class_topic_number === undefined ? {} : { class_topic_number: null }),
    ...(payload.meeting_url ? { meeting_url: payload.meeting_url } : payload.meeting_url === undefined ? {} : { meeting_url: null }),
    ...(payload.book_chapter_id ? { book_chapter_id: payload.book_chapter_id } : payload.book_chapter_id === undefined ? {} : { book_chapter_id: null }),
    ...(payload.exam_id ? { exam_id: payload.exam_id } : payload.exam_id === undefined ? {} : { exam_id: null }),
    ...(payload.custom_title ? { custom_title: payload.custom_title } : payload.custom_title === undefined ? {} : { custom_title: null }),
    ...(payload.fill_colour_start ? { fill_colour_start: payload.fill_colour_start } : payload.fill_colour_start === undefined ? {} : { fill_colour_start: null }),
    ...(payload.fill_colour_stop ? { fill_colour_stop: payload.fill_colour_stop } : payload.fill_colour_stop === undefined ? {} : { fill_colour_stop: null }),
    ...(payload.font_colour ? { font_colour: payload.font_colour } : payload.font_colour === undefined ? {} : { font_colour: null }),
    ...(payload.course_tutor_id ? { course_tutor_id: payload.course_tutor_id } : payload.course_tutor_id === undefined ? {} : { course_tutor_id: null }),
  })
)
