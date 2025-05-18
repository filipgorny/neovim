import Joi from 'joi'

export const schema = Joi.object({
  gladiator_id: Joi.string().required(),
  cost: Joi.number().required(),
})
