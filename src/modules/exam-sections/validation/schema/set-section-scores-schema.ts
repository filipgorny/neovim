import Joi from 'joi'

export const schema = Joi.object({
  score_min: Joi.number().required(),
  score_max: Joi.number().greater(Joi.ref('score_min')).required(),
})
