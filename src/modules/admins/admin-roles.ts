/**
 * Jon decided to pause the implementation of this feature. As a fallback all roles are currently mapped to "employee"
 * but when deciding to implement this fully, each role should have the value of it's name,
 * e.g. flashcard_admin = 'flashcard_admin'
 */
export enum AdminRoleEnum {
  master_admin = 'master_admin',
  employee = 'employee', // deprecated
  igor = 'employee', // a joke by Jon as Igor is his trusted companion (see "Frankenstein's Monster")
  retail_admin = 'employee',
  author_admin = 'employee',
  flashcard_admin = 'employee',
  content_question_admin = 'employee',
  video_editor = 'employee',
  test_admin = 'employee',
  glossary_admin = 'employee',
}

export type AdminRole = keyof typeof AdminRoleEnum

export const AdminRoles = Object.values(AdminRoleEnum)
