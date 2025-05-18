import { StudentCourseTypes } from '../student-courses/student-course-types'

export type StudentGroup = {
  type: StudentCourseTypes.liveCourse
  course_id: string
  expires_at?: string
  end_date_id?: string
} | {
  type: StudentCourseTypes.freeTrial | StudentCourseTypes.onDemand
  course_id: string
  days_amount?: number | string
}
