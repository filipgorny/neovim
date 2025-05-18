import Joi from 'joi'

export const schema = Joi.object({
  external_id: Joi.string().required(),
  external_created_at: Joi.string().required(),
})
