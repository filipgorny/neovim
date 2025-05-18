import { StudentCourse } from '../../../types/student-course'
import { createEntity } from '../student-course-end-date-days-service'
import { findOne } from '../student-course-end-date-days-repository'

type Payload = {
  course_end_date_days_id: string
}

export default async (studentCourse: StudentCourse, payload: Payload) => {
  const endDateDay = await findOne({ course_end_date_days_id: payload.course_end_date_days_id, student_course_id: studentCourse.id })

  return endDateDay || createEntity({
    ...payload,
    student_course_id: studentCourse.id,
  })
}
