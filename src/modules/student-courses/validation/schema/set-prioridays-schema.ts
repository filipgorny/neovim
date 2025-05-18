import Joi from 'joi'

export const schema = Joi.object({
  prioridays: Joi.array().items(
    Joi.number().min(0).max(7).required()
  ).length(7).required(),
})
