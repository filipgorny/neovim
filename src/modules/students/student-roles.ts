export enum StudentRoleEnum {
  standard = 'standard',
  impersonator_admin = 'impersonator_admin',
  exam_preview = 'exam_preview',
}

export type StudentRole = keyof typeof StudentRoleEnum

export const StudentRoles = Object.values(StudentRoleEnum)
