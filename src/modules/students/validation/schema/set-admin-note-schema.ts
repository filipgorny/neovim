import Joi from 'joi'

export const schema = Joi.object({
  admin_note: Joi.string().required().allow(''),
})
