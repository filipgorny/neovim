export enum UserRoleEnum {
  student = 'student',
  admin = 'admin',
}

export type UserRole = keyof typeof UserRoleEnum
