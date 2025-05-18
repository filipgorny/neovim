import Joi from 'joi'
import { HangmanPhraseCategory } from '../../../hangman-phrases/hangman-phrases-categories-enum'

export const RANDOM = 'RANDOM'

export const schema = Joi.object({
  category: Joi.string().valid(RANDOM, ...Object.values(HangmanPhraseCategory)).required(),
})
