import { StudentCourseTypes } from '../../src/modules/student-courses/student-course-types'
import { StudentCourse } from '../../src/types/student-course'

export const isFreeTrialCourse = (studentCourse: StudentCourse) => (
  studentCourse.type === StudentCourseTypes.freeTrial
)
