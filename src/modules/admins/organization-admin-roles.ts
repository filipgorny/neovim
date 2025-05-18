export enum OrganizationAdminRoleEnum {
  master_admin = 'master_admin',
  admin = 'admin',
}

export type OrganizationAdminRole = keyof typeof OrganizationAdminRoleEnum

export const OrganizationAdminRoles = Object.values(OrganizationAdminRoleEnum)
