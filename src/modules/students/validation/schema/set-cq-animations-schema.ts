import Joi from 'joi'

export const schema = Joi.object({
  cq_animations_enabled: Joi.boolean().required(),
})
