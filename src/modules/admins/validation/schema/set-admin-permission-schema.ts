import Joi from 'joi'
import { AdminGlobalPermissions } from '../../admin-global-permissions'

export const schema = Joi.object({
  permission: Joi.string().valid(...AdminGlobalPermissions).required(),
  is_enabled: Joi.boolean().required(),
})
