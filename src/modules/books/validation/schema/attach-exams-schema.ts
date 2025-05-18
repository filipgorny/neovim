import Joi from 'joi'

export const schema = Joi.object({
  is_free_trial: Joi.boolean().required(),
})
