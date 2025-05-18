import Joi from 'joi'

export const schema = Joi.object({
  semester_name: Joi.string().required().allow(''),
})
