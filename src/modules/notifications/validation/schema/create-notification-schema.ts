import Joi from 'joi'
import { NotificationType } from '../../notification-type'
import { schema as studentGroupsSchema } from './student-groups-schema'
import { schema as recurringDefinitionSchema } from './recurring-definition-schema'

export const schema = Joi.object({
  type: Joi.string().valid(...Object.values(NotificationType)).required(),
  author_id: Joi.string().uuid().required(),
  title: Joi.string().required(),
  description_raw: Joi.string().required(),
  description_delta_object: Joi.string().required(),
  description_html: Joi.string().required(),
  student_groups: studentGroupsSchema.required(),
  broken_scheduled_for: Joi.string().allow(null).optional(),
  recurring_definition: recurringDefinitionSchema.allow(null).optional(),
})
