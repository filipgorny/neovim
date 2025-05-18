import { StudentCourse } from '../../../types/student-course'
import { deleteEntity } from '../student-course-end-date-days-service'
import { findOne } from '../student-course-end-date-days-repository'

export default async (studentCourse: StudentCourse, id: string) => {
  const endDateDay = await findOne({ id, student_course_id: studentCourse.id })

  return endDateDay ? deleteEntity(id) : {}
}
