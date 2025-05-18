import Joi from 'joi'

export const schema = Joi.object({
  organization_id: Joi.string().uuid().required(),
  email: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
})
