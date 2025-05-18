import Joi from 'joi'

export const schema = Joi.object({
  score_map: Joi.array().items(
    Joi.number().integer()
  ).required(),
})
