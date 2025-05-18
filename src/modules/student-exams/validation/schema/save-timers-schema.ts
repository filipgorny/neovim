import Joi from 'joi'

export const schema = Joi.object({
  timers: Joi.any().required(),
  timerCheckboxes: Joi.any().required()
})
