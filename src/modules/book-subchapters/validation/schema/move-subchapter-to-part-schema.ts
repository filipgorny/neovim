import Joi from 'joi'

export const schema = Joi.object({
  part: Joi.number().required(),
})
