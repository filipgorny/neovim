import { findOneOrFail } from '../../student-courses/student-course-repository'
import { pauseCourse } from '../../student-courses/student-course-service'
import { coursePaused } from '../../../../services/notification/notification-dispatcher'

export default async (courseId: string) => {
  const course = await findOneOrFail({ id: courseId }, ['student'])
  const pausedCourse = await pauseCourse(course.id)

  await coursePaused({
    email: course.student.email,
  })

  return pausedCourse
}
