import { StudentCourse } from '../../../types/student-course'
import { closeExtensionModal } from '../student-course-service'

export default async (studentCourse: StudentCourse) => (
  closeExtensionModal(studentCourse.id)
)
