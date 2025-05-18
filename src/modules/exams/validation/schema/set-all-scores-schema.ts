import Joi from 'joi'

export const schema = Joi.object({
  scores: Joi.array().items(
    Joi.object({
      score: Joi.number().required(),
      percentile_rank: Joi.number().required(),
    })
  ).required(),
})
