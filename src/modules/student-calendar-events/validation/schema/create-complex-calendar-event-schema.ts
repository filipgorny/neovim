import Joi from 'joi'
import { CalendarEventType, CalendarEventTypeValues } from '../../calendar-event-type'
import { CalendarEventStatusValues } from '../../calendar-event-status'

export const schema = Joi.object({
  event_type: Joi.string().valid(...CalendarEventTypeValues).required(),
  data: Joi.alternatives().conditional('event_type', {
    switch: [
      {
        is: CalendarEventType.fullLengthExam,
        then: Joi.object({
          title: Joi.string().required(),
          event_date: Joi.date().required(),
          exam_id: Joi.string().uuid().required(),
          status: Joi.string().valid(...CalendarEventStatusValues).optional(),
        }),
      },
      {
        is: CalendarEventType.sectionExam,
        then: Joi.object({
          title: Joi.string().required(),
          event_date: Joi.date().required(),
          exam_id: Joi.string().uuid().required(),
          status: Joi.string().valid(...CalendarEventStatusValues).optional(),
        }),
      },
      {
        is: CalendarEventType.customEventType,
        then: Joi.object({
          title: Joi.string().required(),
          event_date: Joi.date().required(),
          custom_event_type_id: Joi.string().uuid().required(),
          status: Joi.string().valid(...CalendarEventStatusValues).optional(),
        }),
      },
      {
        is: CalendarEventType.custom,
        then: Joi.object({
          title: Joi.string().required(),
          descrtiption: Joi.string().optional(),
          event_date: Joi.date().required(),
          duration: Joi.number().positive().required(),
          status: Joi.string().valid(...CalendarEventStatusValues).optional(),
        }),
      },
      {
        is: CalendarEventType.bookLink,
        then: Joi.object({
          title: Joi.string().required(),
          event_date: Joi.date().required(),
          student_book_chapter_id: Joi.string().uuid().required(),
          status: Joi.string().valid(...CalendarEventStatusValues).optional(),
        }),
      },
      {
        is: CalendarEventType.chapterExam,
        then: Joi.object({
          title: Joi.string().required(),
          event_date: Joi.date().required(),
          exam_id: Joi.string().uuid().required(),
          status: Joi.string().valid(...CalendarEventStatusValues).optional(),
        }),
      },
      {
        is: CalendarEventType.customLiveClass,
        then: Joi.object({
          student_book_chapter_id: Joi.string().uuid().required(),
          course_end_date_day_id: Joi.string().uuid().required(),
          parent_event_id: Joi.string().uuid().required(),
        }),
      },
    ],
  }),
}).options({ allowUnknown: true })
