import Joi from 'joi'
import { ScoreCalculationMethod } from '../../score-calculation-methods'

export const schema = Joi.object({
  layout_id: Joi.string().required(),
  exam_type_id: Joi.string().required(),
  title: Joi.string().required(),
  external_id: Joi.string(),
  google_form_url: Joi.string(),
  score_calculation_method: Joi.string().valid(...Object.values(ScoreCalculationMethod)).required(),
  periodic_table_enabled: Joi.boolean().optional(),
  custom_title: Joi.string().optional(),
  max_completions: Joi.number().positive().max(999).optional(),
})
