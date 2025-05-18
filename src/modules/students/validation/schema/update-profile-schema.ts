import Joi from 'joi'

export const schema = Joi.object({
  username: Joi.string().allow('', null).optional(),
  name: Joi.string().allow('', null).optional(),
  email: Joi.string().allow('', null).optional(),
  phone_number: Joi.string().allow('', null).optional(),
  external_id: Joi.string().allow('', null).optional(),
})
