import Joi from 'joi'

export const schema = Joi.object({
  books: Joi.array().items(
    Joi.string().uuid()
  ).required(),
  freeTrials: Joi.array().items(
    Joi.object({
      freeTrialBook: Joi.string().uuid().required(),
      freeTrialExam: Joi.string().uuid().allow(null).required(),
    })
  ),
})
