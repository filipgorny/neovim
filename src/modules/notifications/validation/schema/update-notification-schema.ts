import Joi from 'joi'
import { NotificationType } from '../../notification-type'
import { schema as studentGroupsSchema } from './student-groups-schema'
import { schema as recurringDefinitionSchema } from './recurring-definition-schema'

export const schema = Joi.object({
  type: Joi.string().valid(...Object.values(NotificationType)).optional(),
  title: Joi.string().optional(),
  description_raw: Joi.string().optional(),
  description_delta_object: Joi.string().optional(),
  description_html: Joi.string().optional(),
  student_groups: studentGroupsSchema.optional(),
  broken_scheduled_for: Joi.string().allow(null).optional(),
  recurring_definition: recurringDefinitionSchema.allow(null).optional(),
})
