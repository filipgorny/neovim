import { setPrioridays } from '../student-course-service'
import { validateStudentCourseBelongsToStudent } from '../validation/validate-student-course-belongs-to-student'

type Payload = {
  prioridays: number[]
}

export default async (student, id, payload: Payload) => {
  await validateStudentCourseBelongsToStudent(student.id, id)

  return setPrioridays(id, payload.prioridays)
}
