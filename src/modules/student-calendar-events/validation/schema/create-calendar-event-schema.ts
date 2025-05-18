import Joi from 'joi'
import { CalendarEventStatus } from '../../calendar-event-status'

export const schema = Joi.object({
  title: Joi.string().required(),
  event_date: Joi.date().required(),
  duration: Joi.number().required(),
  action_uri: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid(CalendarEventStatus.complete, CalendarEventStatus.incomplete, CalendarEventStatus.skipped, CalendarEventStatus.archived).optional(),
})
