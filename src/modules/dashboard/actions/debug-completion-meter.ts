import { calculateAccelerationByStudentCourse } from '../../../../services/completion-meter/acceleration-service'
import { calculateMileageByStudentCourse } from '../../../../services/completion-meter/mileage-service'
import { calculateOilLevelByStudentCourse } from '../../../../services/completion-meter/oil-service'
import { fetchTemperatureByStudentCourse } from '../../../../services/completion-meter/temperature-service'
import { calculateVelocityByStudentCourse } from '../../../../services/completion-meter/velocity-service'
import { findOneOrFail as findStudentCourse } from '../../student-courses/student-course-repository'
import { findOneOrFail as findStudent } from '../../students/student-repository'

const DEBUG_MODE = true

export default async (student_course_id: string) => {
  const studentCourse = await findStudentCourse({ id: student_course_id })
  const student = await findStudent({ id: studentCourse.student_id })

  const oil = await calculateOilLevelByStudentCourse(studentCourse, DEBUG_MODE)
  const mileage = await calculateMileageByStudentCourse(student, studentCourse, DEBUG_MODE)
  const velocity = await calculateVelocityByStudentCourse(studentCourse, DEBUG_MODE)
  const acceleration = await calculateAccelerationByStudentCourse(studentCourse, velocity.average_velocity, DEBUG_MODE)
  const temperature = await fetchTemperatureByStudentCourse(studentCourse, DEBUG_MODE)

  return {
    oil,
    mileage,
    velocity,
    temperature,
    acceleration,
  }
}
