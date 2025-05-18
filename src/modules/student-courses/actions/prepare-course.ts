import moment from 'moment'
import R from 'ramda'
import mapP from '../../../../utils/function/mapp'
import { AttachedExamTypeEnum } from '../../attached-exams/attached-exam-types'
import { createFullBook } from '../../books/book-service'
import { findBookForCourse } from '../../course-books/course-book-repository'
import { createExamFacade, createFullExam } from '../../exams/exam-service'
import { createCompletionMeter } from '../../student-completion-meters/student-completion-meters-service'
import { copyCourseTopicsForStudent } from '../../student-course-topics/student-course-topics-service'
import { updateFlashcardSnapshot } from '../student-course-service'
import { StudentCourseStatus } from '../student-course-status'
import { StudentCourseTypes } from '../student-course-types'
import { findOneOrFail, patch } from '../student-courses-repository'
import { validateDateIsFromFuture } from '../validation/validate-date-is-from-future'
import { buildCalendarForStudent } from '../../student-calendar-events/student-calendar-builder'

type Payload = {
  expected_end_date?: string,
}

const mapExams = (type, prop = 'attached_id', is_free_trial = false) => R.pipe(
  R.map(
    attachedExam => {
      return {
        is_free_trial: attachedExam.is_free_trial ? attachedExam.is_free_trial : is_free_trial,
        exam: {
          ...attachedExam.exam,
          attached_exam: {
            type: type,
            id: attachedExam[prop],
            is_free_trial: attachedExam.is_free_trial,
            free_trial_featured_exam: attachedExam.free_trial_featured_exam,
          },
        },
      }
    }
  ),
  R.filter(R.path(['exam', 'id']))
)

const prepareCourseExams = (data) => {
  const exams = R.pipe(
    R.pathOr([], ['original', 'attached']),
    mapExams(AttachedExamTypeEnum.course)
  )(data)

  return exams
}

const prepareBookExams = R.pipe(
  R.pluck('attached'),
  R.flatten,
  R.filter(R.identity),
  mapExams(AttachedExamTypeEnum.book)
)

const prepareChapterExams = R.pipe(
  R.pluck('chapters'),
  R.flatten,
  R.pluck('attached'),
  R.flatten,
  R.filter(R.identity),
  mapExams(AttachedExamTypeEnum.chapter)
)

const prepareFreeTrialExams = R.pipe(
  R.filter(R.propEq('is_free_trial', true)),
  R.reject(R.propEq('free_trial_exam_id', null)),
  R.filter(R.identity),
  mapExams(AttachedExamTypeEnum.book, 'book_id', true)
)

const extractAllExams = (courseBooks, books, course) => R.pipe(
  R.always([
    prepareChapterExams(books),
    prepareBookExams(books),
    prepareCourseExams(course),
  ]),
  R.flatten,
  R.uniqBy(R.path(['exam', 'id'])),
  R.append(prepareFreeTrialExams(courseBooks)),
  R.flatten
)(true)

const getExpireDate = startDate => R.pipe(
  R.propOr('{}', 'metadata'),
  JSON.parse,
  metadata => R.pipe(
    R.prop('expires_at'),
    R.when(
      R.isNil,
      R.pipe(
        R.always(metadata),
        R.propOr(99, 'days_amount'),
        numberOfDays => moment(startDate).add(numberOfDays, 'day')
      )
    )
  )(metadata)
)

const prepareCourseBook = (student_id, course_id, external_created_at) => async (courseBook) => (
  createFullBook(student_id, course_id, external_created_at, courseBook.is_free_trial)(courseBook.book)
)

const prepareCourseExam = (student_id, course_id, external_created_at, exam_retakes_enabled: boolean, max_exam_completions: number) => async (courseExam) => (
  createExamFacade(student_id, course_id, external_created_at, courseExam.is_free_trial, exam_retakes_enabled, max_exam_completions)(courseExam.exam)
)

export default async (student, courseId: string, payload: Payload) => {
  console.time('prepare-course')

  if (payload.expected_end_date) {
    validateDateIsFromFuture(payload.expected_end_date)
  }

  const course = await findOneOrFail({ id: courseId, student_id: student.id }, ['original.attached.exam.sections.passages.questions'])

  if (course.is_already_copied) {
    console.log('Course is already copied')
    console.timeEnd('prepare-course')

    return course
  }

  await patch(course.id, {
    is_already_copied: true,
  })

  const courseBooks = await findBookForCourse(course.original?.id)
  const books = R.pluck('book')(courseBooks)
  const exams = extractAllExams(courseBooks, books, course)
  const startDate = new Date()
  const courseExams = exams

  /**
   * This is left here for reference. We deliberately removed free trial exams from the course exams, in the past.
   */
  // const courseExams = R.when(
  //   R.always(course.type !== StudentCourseTypes.freeTrial),
  //   R.reject(
  //     R.propEq('is_free_trial', true)
  //   )
  // )(exams)

  await mapP(
    prepareCourseBook(student.id, course.id, course.external_created_at)
  )(courseBooks)

  await mapP(
    prepareCourseExam(student.id, course.id, course.external_created_at, course.original.exam_retakes_enabled, course.original.max_exam_completions)
  )(courseExams)

  try {
    await createCompletionMeter(student.id, courseId)
  } catch (error) {}

  await updateFlashcardSnapshot(course.id)
  await copyCourseTopicsForStudent(course.book_course_id, course.id, student.id)

  const executionTime = process.hrtime.bigint()
  console.timeEnd('prepare-course')
  console.log(`PREPARE COURSE execution time: ${Number(executionTime) / 1e9} seconds`)

  return patch(course.id, {
    accessible_from: startDate,
    accessible_to: course.accessible_to ? new Date(course.accessible_to) : getExpireDate(startDate)(course),
    is_ready: true,
    status: StudentCourseStatus.ongoing,
    expected_end_date: payload.expected_end_date,
  })
}
