import Joi from 'joi'
import { HangmanPhraseCategory } from '../../hangman-phrases-categories-enum'

export const schema = Joi.object({
  phrase_raw: Joi.string().optional(),
  phrase_delta_object: Joi.any().optional(),
  phrase_html: Joi.string().optional(),
  category: Joi.string().valid(...Object.values(HangmanPhraseCategory)).optional(),
})
