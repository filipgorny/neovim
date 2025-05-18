import { StopwatchState } from '../stopwatch-state'
import { getLatest, incrementStopwatch, upsertState } from '../stopwatches-repository'
import { notFoundExceptionWithID, stopWatchNotStartedException } from '../../../../utils/error/error-factory'
import { StudentCourse } from '../../../types/student-course'
import { PREVIEW_STUDENT_EMAIL } from '../../../constants'

interface Payload {
  state?: StopwatchState
  seconds?: number
  date: string
}

const PG_FOREIGN_KEY_VIOLATION_ERROR_CODE = '23503'

const isStudentPreview = user => (
  user.get('email') === PREVIEW_STUDENT_EMAIL
)

export default async (user, studentCourse: StudentCourse, payload: Payload) => {
  if (isStudentPreview(user)) {
    return true
  }

  try {
    let updatedItem

    const now = payload.date || new Date()

    if (payload.seconds) {
      const latestStopwatch = await getLatest({
        studentCourseId: studentCourse.id,
        studentId: studentCourse.student_id,
      })

      if (
        latestStopwatch?.state === StopwatchState.Paused &&
              payload.state !== StopwatchState.Started
      ) {
        throw stopWatchNotStartedException()
      }

      updatedItem = await incrementStopwatch({
        studentCourseId: studentCourse.id,
        studentId: studentCourse.student_id,
        date: now,
        seconds: payload.seconds,
      })
    }

    if (payload.state) {
      updatedItem = await upsertState({
        studentCourseId: studentCourse.id,
        studentId: studentCourse.student_id,
        date: now,
        state: payload.state,
      })
    }

    return updatedItem
  } catch (e) {
    if (e.code === PG_FOREIGN_KEY_VIOLATION_ERROR_CODE) {
      throw notFoundExceptionWithID('Course', studentCourse.id)
    } else {
      throw e
    }
  }
}
