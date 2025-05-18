import Joi from 'joi'
import { AdminRoleEnum } from '../../admin-roles'

export const schema = Joi.object({
  email: Joi.string().required(),
  is_active: Joi.boolean().required(),
  admin_role: Joi.string().valid(
    AdminRoleEnum.master_admin,
    AdminRoleEnum.employee,
    AdminRoleEnum.igor,
    AdminRoleEnum.retail_admin,
    AdminRoleEnum.author_admin,
    AdminRoleEnum.content_question_admin,
    AdminRoleEnum.flashcard_admin,
    AdminRoleEnum.glossary_admin,
    AdminRoleEnum.test_admin,
    AdminRoleEnum.video_editor
  ).required(),
  name: Joi.string(),
})
