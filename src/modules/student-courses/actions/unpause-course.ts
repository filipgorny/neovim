import { findOneOrFail } from '../../student-courses/student-course-repository'
import { unpauseCourse } from '../../student-courses/student-course-service'
import { courseUnpaused } from '../../../../services/notification/notification-dispatcher'

export default async (courseId: string) => {
  const course = await findOneOrFail({ id: courseId }, ['student'])
  const unpausedCourse = await unpauseCourse(course.id)

  await courseUnpaused({
    email: course.student.email,
  })

  return unpausedCourse
}
