import Joi from 'joi'
import { join } from 'path'
import { AcidNamesDifficultyEnum } from '../../acid-names-difficulty'

export const schema = Joi.object({
  score: Joi.number().required(),
  correct_amount: Joi.number().required(),
  incorrect_amount: Joi.number().required(),
  blox_game_enabled: Joi.boolean().required(),
  acid_names_difficulty: Joi.string().valid(
    AcidNamesDifficultyEnum.normal,
    AcidNamesDifficultyEnum.short,
    AcidNamesDifficultyEnum.oneLetter
  ).required(),
  answers: Joi.array().items(
    Joi.object({
      acid_id: Joi.string().required(),
      answer: Joi.string().allow(null, '').optional(),
      group: Joi.string().required(),
      is_correct: Joi.boolean().required(),
    })
  ).required(),
  is_a_win: Joi.boolean().required(),
  expenses: Joi.number().required(),
  is_paused: Joi.boolean().required(),
})
