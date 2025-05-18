import Joi from 'joi'

export const schema = Joi.object({
  transaction_id: Joi.string().optional(),
  external_id: Joi.string().required(),
  days_amount: Joi.number().integer().min(1).required(),
  type: Joi.string().optional(),
  external_created_at: Joi.string().optional(),
  metadata: Joi.any().optional(),
  allmeta: Joi.any().optional(),
  product: Joi.any().optional(),
})
