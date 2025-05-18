import { create } from './course-extensions-repository'

export const recordCourseExtension = async (student_id: string, external_id: string, external_created_at: string) => (
  create({
    student_id,
    external_id,
    external_created_at,
  })
)
