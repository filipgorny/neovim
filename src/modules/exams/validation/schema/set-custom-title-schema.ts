import Joi from 'joi'

export const schema = Joi.object({
  custom_title: Joi.string().required().allow(''),
})
