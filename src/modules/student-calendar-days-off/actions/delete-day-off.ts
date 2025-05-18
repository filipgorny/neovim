import { StudentCourse } from '../../../types/student-course'
import { deleteDayOff } from '../student-calendar-days-off-service'

export default async (studentCourse: StudentCourse, id: string) => (
  deleteDayOff(studentCourse.id, id)
)
