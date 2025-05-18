import Joi from 'joi'

export const schema = Joi.object({
  scores: Joi.array().required().items(
    Joi.object({
      correct_answer_amount: Joi.number().positive().required(),
      scaled_score: Joi.number().positive().required(),
      percentile_rank: Joi.number().min(0).max(100).required(),
    })
  ),
})
