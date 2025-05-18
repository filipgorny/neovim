import Joi from 'joi'
import { SECTION_STATUS_REVIEW, SECTION_STATUS_PHASE_3 } from '../../section-statuses'

export const schema = Joi.object({
  status: Joi.string().required().valid(SECTION_STATUS_REVIEW, SECTION_STATUS_PHASE_3)
})
