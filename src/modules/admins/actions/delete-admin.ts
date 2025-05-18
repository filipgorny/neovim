import { deleteAdmin } from '../admin-service'
import validateSelfDelete from '../validation/validate-self-delete'
import { findOneOrFail } from '../admin-repository'

export default async (id, user) => {
  await findOneOrFail({ id })

  validateSelfDelete(id)(user)

  return deleteAdmin(id)
}
