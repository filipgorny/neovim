import * as R from 'ramda'
import moment from 'moment'
import { fetchCourseAttachedToExam, findOneOrFail } from '../student-exam-repository'
import { resetExamForRetake, startExam } from '../student-exam-service'
import { StartExamPayloadDto } from '../dto/start-exam-payload-dto'
import { StudentCourse } from '../../../types/student-course'
import { StudentCourseTypes } from '../../student-courses/student-course-types'
import { examAlreadyCompletedException, throwException, unauthorizedException } from '../../../../utils/error/error-factory'
import { createStudentExamFromFacade } from '../../exams/exam-service'

const findExam = student => async id => (
  findOneOrFail({
    student_id: student.id,
    id,
  })
)

const findCourse = async examId => (
  fetchCourseAttachedToExam(examId)
)

const calculateAccessibleTo = exam => R.ifElse(
  R.prop('accessible_to'),
  R.prop('accessible_to'),
  R.always(moment().add(exam.access_period, 'days'))
)(exam)

const getExpiresAt = R.pipe(
  R.prop('rows'),
  R.head,
  R.ifElse(
    R.prop('accessible_to'),
    R.prop('accessible_to'),
    R.pipe(
      R.prop('metadata'),
      JSON.parse,
      R.prop('expires_at')
    )
  )
)

const startExamInCourseContext = async (student, studentCourse: StudentCourse, id: string, payload: StartExamPayloadDto) => {
  const exam = await findExam(student)(id)
  const course = await findCourse(exam.id)

  if (studentCourse.type === StudentCourseTypes.freeTrial && !exam.is_free_trial) {
    throwException(unauthorizedException())
  }

  // this is probably obsolete because of retakes
  // if (exam.completed_at) {
  //   throwException(examAlreadyCompletedException())
  // }

  if (exam.completions_done >= course.max_completions) {
    throwException(examAlreadyCompletedException())
  }

  await resetExamForRetake(exam.id)

  // exam already started - do nothing
  if (exam.current_page) {
    return exam
  }

  const accessible_to = exam.accessible_to ? new Date(exam.accessible_to) : getExpiresAt(course)

  return startExam(id, accessible_to, payload)
}

const startStandaloneExam = async (student, id: string, payload: StartExamPayloadDto) => {
  const exam = await findExam(student)(id)

  if (exam.completed_at) {
    throwException(examAlreadyCompletedException())
  }

  // exam already started - do nothing
  if (exam.current_page) {
    return exam
  }

  return startExam(id, calculateAccessibleTo(exam), payload)
}

export default async (student, id: string, payload: StartExamPayloadDto, studentCourse: StudentCourse) => {
  const studentExam = await findOneOrFail({ id, student_id: student.id }, ['sections'])

  if (studentExam.sections.length === 0) {
    await createStudentExamFromFacade(studentExam.id, studentCourse)
  }

  try {
    if (studentCourse) {
      await startExamInCourseContext(student, studentCourse, id, payload)
    } else {
      await startStandaloneExam(student, id, payload)
    }
  } catch (e) {
    await startStandaloneExam(student, id, payload)
  }
}
