import Joi from 'joi'
import { HangmanPhraseCategory } from '../../../hangman-phrases/hangman-phrases-categories-enum'
import { RANDOM } from './get-random-unanswered-hangman-phrase-schema'

export const schema = Joi.object({
  category: Joi.string().valid(RANDOM, ...Object.values(HangmanPhraseCategory)).required(),
  answered_phrase_order: Joi.number().required(),
})
