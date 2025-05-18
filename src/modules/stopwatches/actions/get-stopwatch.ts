import { getLatest, sumSeconds } from '../stopwatches-repository'
import { StopwatchState } from '../stopwatch-state'
import { StudentCourse } from '../../../types/student-course'
import { PREVIEW_STUDENT_EMAIL } from '../../../constants'

const isStudentPreview = user => (
  user.get('email') === PREVIEW_STUDENT_EMAIL
)

const dummyStopwatch = {
  seconds: 0,
  state: StopwatchState.Started,
}

export default async (user, studentCourse: StudentCourse) => {
  if (isStudentPreview(user)) {
    return dummyStopwatch
  }

  const { id, student_id } = studentCourse

  const [seconds, latestStopwatch] = await Promise.all([
    sumSeconds({ studentId: student_id, studentCourseId: id }),
    getLatest({ studentId: student_id, studentCourseId: id }),
  ])

  return {
    seconds: seconds,
    state: latestStopwatch?.state ?? StopwatchState.Started,
  }
}
