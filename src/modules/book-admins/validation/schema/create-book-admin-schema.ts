import Joi from 'joi'
import { BookAdminPermissions } from '../../book-admin-permissions'

export const schema = Joi.object({
  book_id: Joi.string().uuid().required(),
  admin_id: Joi.string().uuid().required(),
  permission: Joi.string().valid(...BookAdminPermissions).required(),
})
