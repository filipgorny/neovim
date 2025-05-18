import Joi from 'joi'

export const schema = Joi.object({
  student_id: Joi.string().required(),
  amount: Joi.number().required(),
  operation_subtype: Joi.string(),
})
