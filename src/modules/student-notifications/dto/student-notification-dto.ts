export type StudentNotificationDTO = {
  author_id: string
  notification_id: string
  student_id: string
  student_course_id: string
  created_at: string
  title: string
  description_raw: string
  description_delta_object: string
  description_html: string
  is_read?: boolean
  is_seen?: boolean
}

export type StudentNotification = { id: string } & StudentNotificationDTO

export const makeDTO = (
  author_id: string,
  notification_id: string,
  student_id: string,
  student_course_id: string,
  created_at: string,
  title: string,
  description_raw: string,
  description_delta_object: string,
  description_html: string,
  is_read?: boolean,
  is_seen?: boolean
): StudentNotificationDTO => ({
  author_id,
  notification_id,
  student_id,
  student_course_id,
  created_at,
  title,
  description_raw,
  description_delta_object,
  description_html,
  is_read,
  is_seen,
})

export default StudentNotificationDTO
