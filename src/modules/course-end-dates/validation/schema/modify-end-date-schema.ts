import Joi from 'joi'

export const schema = Joi.object({
  end_date: Joi.string().required(),
})
