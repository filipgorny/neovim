export enum UserRoleEnum {
  libertus = 'libertus',
  plebeian = 'plebeian',
  patrician = 'patrician',
}

export type UserRole = keyof typeof UserRoleEnum

export const UserRoles = Object.values(UserRoleEnum)
