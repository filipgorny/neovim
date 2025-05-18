import Joi from 'joi'

export const schema = Joi.object({
  note: Joi.string().max(200).required(),
})
