export enum AdminGlobalPermissionsEnum {
  can_manage_glossary = 'can_manage_glossary',
  can_manage_flashcards = 'can_manage_flashcards',
  can_manage_videos = 'can_manage_videos',
  can_manage_content_questions = 'can_manage_content_questions',
  can_manage_exams = 'can_manage_exams',
  can_manage_students = 'can_manage_students',
  can_manage_courses = 'can_manage_courses',
  can_manage_animations = 'can_manage_animations',
  can_manage_score_tables = 'can_manage_score_tables',
  can_manage_notifications = 'can_manage_notifications',
  can_manage_course_topics = 'can_manage_course_topics',
}

export const AdminGlobalPermissions = Object.values(AdminGlobalPermissionsEnum)

export enum GlobalPerms {
  G = 'can_manage_glossary',
  F = 'can_manage_flashcards',
  V = 'can_manage_videos',
  C = 'can_manage_content_questions',
  E = 'can_manage_exams',
  S = 'can_manage_students',
  X = 'can_manage_courses',
  A = 'can_manage_animations',
  T = 'can_manage_score_tables',
  N = 'can_manage_notifications',
  R = 'can_manage_course_topics',
}
