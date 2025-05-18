import Joi from 'joi'
import { HangmanPhraseCategory } from '../../hangman-phrases-categories-enum'

export const schema = Joi.object({
  phrase_raw: Joi.string().required(),
  phrase_delta_object: Joi.any().required(),
  phrase_html: Joi.string().required(),
  category: Joi.string().valid(...Object.values(HangmanPhraseCategory)).required(),
})
