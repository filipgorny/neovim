import Joi from 'joi'
import { HangmanPhraseCategory } from '../../hangman-phrases-categories-enum'

export const schema = Joi.object({
  phrase_raw: Joi.string().optional(),
  phrase_delta_object: Joi.any().optional(),
  phrase_html: Joi.string().optional(),
  category: Joi.string().valid(...Object.values(HangmanPhraseCategory)).optional(),
  hints: Joi.array().min(5).max(5).items(
    Joi.object({
      hint_raw: Joi.string().required(),
      hint_delta_object: Joi.any().required(),
      hint_html: Joi.string().required(),
      order: Joi.number().required(),
    })
  ).optional(),
  image_hint: Joi.string().allow(null).optional(),
})
