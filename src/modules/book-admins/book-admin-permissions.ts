export enum BookAdminPermissionsEnum {
  assign_flashcards = 'assign_flashcards',
  assign_videos = 'assign_videos',
  assign_content_questions = 'assign_content_questions',
  edit_content = 'edit_content',
  view_book = 'view_book',
  assign_course_topics = 'assign_course_topics',
}

export const BookAdminPermissions = Object.values(BookAdminPermissionsEnum)
