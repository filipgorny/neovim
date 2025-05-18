import * as R from 'ramda'
import moment from 'moment'
import { DATETIME_DATABASE_FORMAT, DATE_FORMAT_YMD, DATETIME_COURSE_FORMAT, DATETIME_JSON_FORMAT } from '../../constants'
import { StudentCourse, StudentCourseDTO } from '../../types/student-course'
import { findOneOrFail as findCourse, find as findCourses, patch, deleteRecord as deleteCourse, createStudentCourse, findLatestCourse, findOneOrFail } from './student-course-repository'
import { StudentCourseStatus } from './student-course-status'
import { expireCourse } from './student-courses-repository'
import { deleteStudentExamsByCourseId } from '../student-exams/student-exam-service'
import { find as findBooks, getListOfBookIdsByCourseId } from '../student-books/student-book-repository'
import { deleteRecord as deleteCourseActivityTimer } from '../student-course-activity-timers/student-course-activity-timers-repository'
import { deleteRecord as deleteBookActivityTimer } from '../student-book-activity-timers/student-book-activity-timers-repository'
import { deleteRecord as deleteFlashcardActivityTimer } from '../flashcard-activity-timers/flashcard-activity-timers-repository'
import { deleteRecord as deleteChapterActivityTimer } from '../student-book-chapter-activity-timers/student-book-chapter-activity-timers-repository'
import { deleteRecord as deleteCompletionMeter } from '../student-completion-meters/student-completion-meters-repository'
import { deleteRecord as deleteArchivedFlashcard } from '../student-flashcard-archive/student-flashcard-archive-repository'
import { deleteBook } from '../student-books/student-book-service'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import mapP from '../../../utils/function/mapp'
import { deleteByStudentCourseId as deleteStopwatches } from '../stopwatches/stopwatch-service'
import { isFreeTrialCourse } from '../../../services/student-course/is-free-trial-course'
import { countFlashcardsByBookId, countFlashcardsByChapterId, countFlashcardsByCourseId } from '../student-book-content-flashcards/student-book-content-flashcard-repository'
import { getListOfChapterIdsByBookId } from '../student-book-chapters/student-book-chapter-repository'
import { deleteByStudentCourseId as deleteStudentCourseTopicsByCourseId } from '../student-course-topics/student-course-topics-repository'
import { deleteRecord as deleteStudentBookContentComment } from '../student-book-content-comments/student-book-content-comments-repository'
import { customException, throwException } from '../../../utils/error/error-factory'
import { findOneOrFailByExternalId } from '../courses/course-repository'
import { StudentCourseTypes } from './student-course-types'
import { Payload as PurchaseCoursePayload } from './actions/purchase-course'
import { Payload as PurchaseExtentionPayload } from './actions/purchase-extention'
import { patch as patchStudent } from '../students/student-repository'
import { getEndDate, eliminateTime } from '../course-end-dates/course-end-dates-service'
import { int, notFoundException } from '@desmart/js-utils'
import { findByExternalId, findCoursesByTransactionId, validateCourseBelongsToStudent } from './actions/details-by-transaction'
import forEachP from '../../../utils/function/foreachp'
import logger from '../../../services/logger/logger'
import { convertUsaDate } from '../../../utils/datetime/convert-usa-date'
import { archiveEventsLockedInFreeTrial } from '../student-calendar-events/student-calendar-events-service'
import rescheduleCalendar from './actions/reschedule-calendar'

export const upgradeFreeTrial = async (freeTrial: StudentCourse, data: StudentCourseDTO) => (
  patch(freeTrial.id, data)
)

const addNDays = (date, n) => (
  moment(date).add(n, 'days').format(DATETIME_DATABASE_FORMAT)
)

export const extendCourse = async (course: StudentCourse, daysAmount: number, type?: StudentCourseTypes) => {
  if (course.accessible_to !== null) {
    logger.info('extendCourse: accessible_to !== null', { course, daysAmount, type })

    const metadata = JSON.parse(course.metadata)

    const newMetadataObject = {
      days_amount: `${int(metadata.days_amount) + int(daysAmount)}`,
      extended_from_type: course.type,
    }

    if (course.type === StudentCourseTypes.freeTrial) {
      // @ts-ignore
      newMetadataObject.calendar_archive_tooltip = true
    }

    const newMetadata = JSON.stringify(newMetadataObject)

    if (!course.mcat_date_id) {
      await closeExtensionModal(course.id)
    }

    const updatedCourse = await patch(course.id, {
      accessible_to: moment().isAfter(moment(course.accessible_to))
        ? moment().add(daysAmount, 'days').format(DATETIME_DATABASE_FORMAT)
        : addNDays(course.accessible_to, daysAmount),
      status: StudentCourseStatus.ongoing,
      metadata: newMetadata,
      type: type || course.type,
    })

    logger.info('extendCourse: done', { updatedCourse })
    return updatedCourse
  } else {
    logger.info('extendCourse: accessible_to === null', { course, daysAmount, type })

    const metadata = JSON.parse(course.metadata)

    const newMetadataObject = {
      days_amount: `${int(metadata.days_amount) + int(daysAmount)}`,
      extended_from_type: course.type,
    }

    if (course.type === StudentCourseTypes.freeTrial) {
      // @ts-ignore
      newMetadataObject.calendar_archive_tooltip = true
    }

    const newMetadata = JSON.stringify(newMetadataObject)

    if (!course.mcat_date_id) {
      await closeExtensionModal(course.id)
    }

    logger.info('extendCourse:', { newMetadata })
    const updatedCourse = await patch(course.id, { metadata: newMetadata, type: type || course.type })

    logger.info('extendCourse: done', { updatedCourse })
    return updatedCourse
  }
}

export const expireStudentCourse = (adminId: string) => async exam => (
  expireCourse(exam.id)
)

export const setExpectedEndDate = async (id: string, expected_end_date: string) => (
  patch(id, { expected_end_date })
)

export const setExamAtDate = async (id: string, exam_at: string) => (
  patch(id, { exam_at })
)

export const setIsPreReading = async (id: string, is_pre_reading: boolean) => (
  patch(id, { is_pre_reading })
)

export const setCalendarStartDate = async (id: string, calendar_start_at: string) => (
  patch(id, { calendar_start_at })
)

export const setMcatDate = async (id: string, mcat_date_id: string) => (
  patch(id, { mcat_date_id })
)

export const setPreReadingEndDate = async (id: string, pre_reading_end_date: string) => (
  patch(id, { pre_reading_end_date })
)

export const setDaysOffIgnored = async (id: string, days_off_ignored: boolean) => (
  patch(id, { days_off_ignored })
)

export const pauseCourse = async (id: string) => (
  patch(id, { is_paused: true })
)

export const unpauseCourse = async (id: string) => (
  patch(id, { is_paused: false })
)

export const setSiteActivity = async (id: string, site_activity: string) => (
  patch(id, { site_activity })
)

export const bumpAccessedAt = async (id: string) => (
  patch(id, { accessed_at: moment().format(DATETIME_DATABASE_FORMAT) })
)

export const increaseCurrentStudyStreak = async (studentCourse: StudentCourse) => {
  const updated = await patch(studentCourse.id, { current_study_streak: studentCourse.current_study_streak + 1 })

  if (updated.get('current_study_streak') > studentCourse.longest_study_streak) {
    await patch(updated.id, { longest_study_streak: updated.get('current_study_streak') })
  }

  return updated
}

export const resetCurrentStudyStreak = async (studentCourse: StudentCourse) => (
  patch(studentCourse.id, { current_study_streak: 1 })
)

export const deleteStudentCourse = async (id: string, trx) => {
  const studentCourse = await findCourse({ id }, ['courseActivityTimers', 'bookActivityTimers', 'flashcardActivityTimers', 'completionMeter', 'chapterActivityTimers', 'contentComments', 'archivedFlashcards'])
  await deleteStudentExamsByCourseId(id, trx)

  const courseBookIds = await R.pipeWith(R.andThen)([
    async id => findBooks({ limit: { page: 1, take: 100 }, order: { by: 'title', dir: 'asc' } }, {
      course_id: id,
    }),
    R.prop('data'),
    collectionToJson,
    R.pluck('id'),
  ])(id)

  await forEachP(deleteBook)(courseBookIds)
  await forEachP(deleteCourseActivityTimer)(
    R.pipe(
      R.prop('courseActivityTimers'),
      R.pluck('id')
    )(studentCourse)
  )
  await forEachP(deleteChapterActivityTimer)(
    R.pipe(
      R.prop('chapterActivityTimers'),
      R.pluck('id')
    )(studentCourse)
  )
  await forEachP(deleteBookActivityTimer)(
    R.pipe(
      R.prop('bookActivityTimers'),
      R.pluck('id')
    )(studentCourse)
  )
  await forEachP(deleteFlashcardActivityTimer)(
    R.pipe(
      R.prop('flashcardActivityTimers'),
      R.pluck('id')
    )(studentCourse)
  )
  await forEachP(deleteStudentBookContentComment)(
    R.pipe(
      R.prop('contentComments'),
      R.pluck('id')
    )(studentCourse)
  )
  await forEachP(deleteArchivedFlashcard)(
    R.pipe(
      R.prop('archivedFlashcards'),
      R.pluck('id')
    )(studentCourse)
  )

  const completionMeterId = R.path(['completionMeter', 'id'])(studentCourse)
  await R.unless(
    R.isNil,
    async (completionMeterId) => await deleteCompletionMeter(completionMeterId)
  )(completionMeterId)
  await deleteStopwatches(id)

  await deleteStudentCourseTopicsByCourseId(id)

  return deleteCourse(id)
}

/**
 * If the date is from the past - the course is "expired"
 * If it's from the future, the course is "ongoing" if it was "ready",
 * it's "scheduled" otherwise.
 */
const determineCourseStatus = (isFutureDate: boolean, isCourseReady: boolean) => (
  isFutureDate
    ? isCourseReady ? StudentCourseStatus.ongoing : StudentCourseStatus.scheduled
    : StudentCourseStatus.expired
)

export const setAccessibleTo = async (id: string, accessible_to: string) => {
  const isFutureDate = moment(accessible_to).isAfter(moment())
  const course = await findCourse({ id })
  const status = determineCourseStatus(isFutureDate, course.is_ready)

  return patch(id, {
    accessible_to,
    status,
  })
}

export const isFreeTrialStudent = async (student_id: string) => R.pipeWith(R.andThen)([
  async () => findCourses({ limit: { page: 1, take: 1000 }, order: undefined }, { student_id }),
  R.prop('data'),
  collectionToJson,
  R.map(studentCourse => !isFreeTrialCourse(studentCourse)),
  R.any(R.identity),
  R.not,
])(true)

export const getFlashcardSnapshotByCourseId = async (course_id: string): Promise<object> => {
  const bookIds = await getListOfBookIdsByCourseId(course_id)
  const amountInCourse = await countFlashcardsByCourseId(course_id)

  const getFlashcardSnapshotByBookId = async (book_id: string): Promise<object> => {
    const chapterIds = await getListOfChapterIdsByBookId(book_id)
    const amountInBook = await countFlashcardsByBookId(book_id)

    const getFlashcardSnapshotByChapterId = async (chapter_id: string): Promise<object> => {
      const amountInChapter = await countFlashcardsByChapterId(chapter_id)

      return {
        id: chapter_id,
        amount: amountInChapter,
      }
    }

    return {
      id: book_id,
      amount: amountInBook,
      chapters: await mapP(getFlashcardSnapshotByChapterId)(chapterIds) || [],
    }
  }

  return {
    id: course_id,
    amount: amountInCourse,
    books: await mapP(getFlashcardSnapshotByBookId)(bookIds) || [],
  }
}

export const setFlashcardSnapshot = async (course_id: string, flashcard_snapshot: string) => (
  patch(course_id, { flashcard_snapshot })
)

export const setPrioridays = async (id: string, prioridays: number[]) => (
  patch(id, { prioridays: JSON.stringify(prioridays) })
)

export const markVideosAsMigrated = async (id: string) => (
  patch(id, { videos_migrated: true })
)

export const updateFlashcardSnapshot = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    getFlashcardSnapshotByCourseId,
    JSON.stringify,
    async flashcard_snapshot => setFlashcardSnapshot(course_id, flashcard_snapshot),
  ])(course_id)
)

export const setBookOrder = async (course_id: string, book_order: string) => (
  patch(course_id, { book_order })
)

const handleLiveCoursePayload = (payload: PurchaseCoursePayload) => {
  if (!R.path(['metadata', 'expires_at'], payload)) {
    throwException(customException('student-courses.live-course.invalid-metadata', 422, 'Metadata must contain "expires_at" field'))
  }
  if (!moment(R.path(['metadata', 'expires_at'], payload), DATE_FORMAT_YMD).isValid()) {
    throwException(customException('student-courses.live-course.invalid-expiry-date', 422, `Expiry date must be in format '${DATE_FORMAT_YMD}'`))
  }

  return [
    moment(payload.external_created_at).format(DATETIME_DATABASE_FORMAT), // moment().format(DATETIME_DATABASE_FORMAT) ?
    eliminateTime(R.path(['metadata', 'expires_at'], payload)),
    StudentCourseStatus.ongoing,
  ]
}

const handleFreeTrialPayload = (payload: PurchaseCoursePayload) => {
  if (!R.path(['metadata', 'days_amount'], payload)) {
    throwException(customException('student-courses.free-trial.invalid-metadata', 422, 'Metadata must contain "days_amount" field'))
  }

  return [
    moment(payload.external_created_at).format(DATETIME_DATABASE_FORMAT), // moment().format(DATETIME_DATABASE_FORMAT) ?
    moment(payload.external_created_at).add(R.path(['metadata', 'days_amount'], payload), 'days').format(DATETIME_DATABASE_FORMAT),
    StudentCourseStatus.ongoing,
  ]
}

const handleOnDemandPayload = (payload: PurchaseCoursePayload) => {
  if (!R.path(['metadata', 'days_amount'], payload)) {
    throwException(customException('student-courses.on-demand.invalid-metadata', 422, 'Metadata must contain "days_amount" field'))
  }

  return [
    null,
    null,
    StudentCourseStatus.scheduled,
  ]
}

export const purchaseCourse = async (student, payload: PurchaseCoursePayload) => {
  let accessibleTo, accessibleFrom, status, endDate
  const originalCourse = await findOneOrFailByExternalId(payload.external_id.split(',')[0])
  const title = originalCourse.title

  payload.external_created_at = convertUsaDate(payload.external_created_at)

  if (!moment(payload.external_created_at, DATETIME_JSON_FORMAT).isValid()) {
    throwException(customException('student-courses.invalid-creation-date', 422, `External creation date must be in format '${DATETIME_JSON_FORMAT}'`))
  }

  switch (payload.type) {
    case StudentCourseTypes.liveCourse:
      [accessibleFrom, accessibleTo, status] = handleLiveCoursePayload(payload)

      endDate = await getEndDate(originalCourse.id, accessibleTo)

      if (!endDate) {
        throwException(customException('student-courses.course-end-date.does-not-exist', 404, 'Course end date does not exist'))
      }
      break
    case StudentCourseTypes.freeTrial:
      [accessibleFrom, accessibleTo, status] = handleFreeTrialPayload(payload)
      break
    case StudentCourseTypes.onDemand:
      [accessibleFrom, accessibleTo, status] = handleOnDemandPayload(payload)
      break
  }

  const result = createStudentCourse(
    R.pipe(
      R.omit(['external_id']),
      R.set(R.lensProp('accessible_from'), accessibleFrom),
      R.set(R.lensProp('accessible_to'), accessibleTo),
      R.set(R.lensProp('original_end_date'), accessibleTo),
      R.set(R.lensProp('status'), status),
      R.set(R.lensProp('title'), title),
      R.set(R.lensProp('subtitle'), payload.external_id),
      R.set(R.lensProp('student_id'), student.id),
      R.set(R.lensProp('book_course_id'), originalCourse.id),
      R.set(R.lensProp('original_metadata'), { ...payload.metadata, calendar_archive_tooltip: true }),
      R.set(R.lensProp('metadata'), { ...payload.metadata, calendar_archive_tooltip: true }),
      R.set(R.lensProp('transaction_id'), payload.transaction_id),
      R.set(R.lensProp('end_date_id'), endDate ? endDate.id : null)
    )(payload)
  )

  await patchStudent(student.id, { has_courses: true })

  return result
}

export const extendLatestCourse = async (course_id: string, student_id: string, days_amount: number) => {
  const latestCourse = await findLatestCourse(course_id, student_id)

  logger.info('extendLatestCourse', { latestCourse, student_id, days_amount })

  return extendCourse(latestCourse, days_amount)
}

export const purchaseExtention = async (student, payload: PurchaseExtentionPayload) => {
  logger.info('purchaseExtention', { student, payload })

  if (!payload.transaction_id) {
    logger.info('purchaseExtention: no transaction_id')
    const course = await findOneOrFailByExternalId(payload.external_id)

    logger.info('purchaseExtention: about to extend course', { course, student_id: student.id, days_amount: payload.days_amount })
    const updatedCourse = await extendLatestCourse(course.id, student.id, payload.days_amount)

    // Tasks locked in free trial should be archived
    if (course.type === 'free_trial') {
      await archiveEventsLockedInFreeTrial(updatedCourse, payload.days_amount)
      await rescheduleCalendar(student, course.id, { build_calendar: -2, exam_at: updatedCourse.get('accessible_to'), mcat_date_id: course.mcat_date_id })
    }

    logger.info('purchaseExtention: done', { updatedCourse })
    return updatedCourse
  }

  logger.info('purchaseExtention: transaction_id is not falsy')
  const courses = await findCoursesByTransactionId(payload.transaction_id)
  const course = await findByExternalId(payload.external_id)(courses)

  logger.info('purchaseExtention: about to extend course', { course, student_id: student.id, days_amount: payload.days_amount })

  if (!course) {
    logger.error('purchaseExtention: course not found')
    throwException(notFoundException('student-course'))
  }

  validateCourseBelongsToStudent(student, course)

  const updatedCourse = await extendCourse(course, payload.days_amount, payload.type)

  // Tasks locked in free trial should be archived
  if (course && course.type === 'free_trial') {
    // using original course to archive events based on the original course's accessible_to
    await archiveEventsLockedInFreeTrial(course, payload.days_amount)
    await rescheduleCalendar(student, course.id, { build_calendar: -2, exam_at: updatedCourse.get('accessible_to'), mcat_date_id: course.mcat_date_id })
  }

  logger.info('purchaseExtention: done', { updatedCourse })
  return updatedCourse
}

export const bumpSiteActivityForStudentCourse = async (studentCourse: StudentCourse, duration: number, activityType: string) => {
  const siteActivity = studentCourse.site_activity

  siteActivity[activityType] ? siteActivity[activityType] += duration : siteActivity[activityType] = duration

  return setSiteActivity(studentCourse.id, JSON.stringify(siteActivity))
}

export const closeExtensionModal = async (id: string) => (
  patch(id, { extension_calendar_modal_closed: true })
)

export const snoozeCalendarArchiveModal = async (studentCourse: StudentCourse, snoozeUntil?: string) => {
  const metadata = JSON.parse(studentCourse.metadata)

  metadata.calendar_archive_tooltip = snoozeUntil || false

  patch(studentCourse.id, { metadata: JSON.stringify(metadata) })
}
