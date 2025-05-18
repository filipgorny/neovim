import { randomString } from '@desmart/js-utils'
import { create, patch, deleteRecord } from './organization-admins-repository'
import { OrganizationAdminRole } from './organization-admin-roles'

type AdminPayload = {
  organization_id: string
  email: string
  first_name: string
  last_name: string
}

export const createEntity = async (dto: {}) => (
  create(dto)
)

export const createMasterAdmin = async (dto: AdminPayload) => (
  create({
    ...dto,
    is_active: true,
    password: randomString(),
    admin_role: OrganizationAdminRole.MASTER_ADMIN,
  })
)

export const createAdmin = async (dto: AdminPayload) => (
  create({
    ...dto,
    is_active: true,
    password: randomString(),
    admin_role: OrganizationAdminRole.ADMIN,
  })
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)
