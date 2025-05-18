import Joi from 'joi'
import { ScoreCalculationMethod } from '../../score-calculation-methods'

export const schema = Joi.object({
  title: Joi.string().required(),
  custom_title: Joi.string().allow(null, '').optional(),
  external_id: Joi.string().required(),
  google_form_url: Joi.string().allow(null, '').optional(),
  score_calculation_method: Joi.string().valid(...Object.values(ScoreCalculationMethod)).required(),
  max_completions: Joi.number().positive().max(999).optional(),
  periodic_table_enabled: Joi.boolean().optional(),
})
