import { AdminRole } from '../admin-roles'

export type AdminDTO = {
  email: string,
  password: string,
  admin_role: AdminRole,
  name: string
}

export const makeDTO = (email: string, password: string, admin_role: AdminRole, name: string) => ({
  email,
  password,
  admin_role,
  name,
})

export default AdminDTO
