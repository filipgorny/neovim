import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().required(),
  custom_event_group_id: Joi.string().uuid().required(),
  duration: Joi.number().positive().optional(),
})
