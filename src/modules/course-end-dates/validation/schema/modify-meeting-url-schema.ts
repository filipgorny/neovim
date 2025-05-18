import Joi from 'joi'

export const schema = Joi.object({
  meeting_url: Joi.string().required().allow(''),
})
