import Joi from 'joi'

export const schema = Joi.object({
  flashcard_count: Joi.number().required(),
})
