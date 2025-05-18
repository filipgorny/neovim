import Joi from 'joi'
import { CalendarEventStatus } from '../../calendar-event-status'

export const schema = Joi.object({
  title: Joi.string().optional(),
  type: Joi.string().optional(),
  event_date: Joi.date().optional(),
  duration: Joi.number().optional(),
  action_uri: Joi.string().optional(),
  order: Joi.number().optional(),
  status: Joi.string().valid(CalendarEventStatus.complete, CalendarEventStatus.incomplete, CalendarEventStatus.skipped, CalendarEventStatus.archived).optional(),
  description: Joi.string().allow(null, '').optional(),
})
