import Joi from 'joi'
import { SiteActivityDurations } from '../../../../../services/site-activity/site-activity-durations'
import { ActivityTypes } from '../../activity-type/activity-type-enum'

export const schema = Joi.object({
  duration: Joi.number().valid(
    SiteActivityDurations.twoMinutes,
    SiteActivityDurations.thirtyMinutes
  ).required(),
  activity_type: Joi.string().valid(...ActivityTypes).optional(),
})
