import * as R from 'ramda'
import moment, { Moment } from 'moment'
import { find as findExams } from '../../student-exams/student-exam-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find as findCalendarFullExams } from '../../calendar-full-exams/calendar-full-exams-repository'
import { StudentCourse } from '../../../types/student-course'
import { CalendarEventType } from '../calendar-event-type'
import { createCalendarEvent } from '../student-calendar-events-service'
import { DATE_FORMAT_YMD } from '../../../constants'
import forEachP from '../../../../utils/function/foreachp'
import { getExamLength } from '../../exams/exam-length-service'
import { findEventByStudentItemId, findOne as findcalendarEvent } from '../student-calendar-events-repository'
import { findAllMatchingStudentExamIds } from './find-all-matching-student-exam-ids'
import { StudentCourseTypes } from '../../student-courses/student-course-types'
import { EventScheduleTask } from '../../../../services/student-calendar-events/schedule-events-coles-algorithm'
import { int } from '@desmart/js-utils'
import { CalendarEventStatus } from '../calendar-event-status'
import { findOne as findAttachedExam } from '../../attached-exams/attached-exam-repository'
import { findAttachedExamWithBookChapter } from '../../student-attached-exams/student-attached-exam-repository'

let fullLengthIndexCorrection = 0

const fetchStudentExams = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findExams({ limit: { page: 1, take: 10000 }, order: { by: 'title', dir: 'asc' } }, { student_id: studentCourse.student_id }, ['originalExam', 'sections']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const getCalendarFullExams = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findCalendarFullExams({ limit: { page: 1, take: 1000 }, order: { by: 'order', dir: 'asc' } }, { course_id: studentCourse.book_course_id }),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const getTitle = (examLength, calendarExam, studentExam) => {
  if (studentExam.originalExam.custom_title) {
    return studentExam.originalExam.custom_title
  }

  return examLength === 375 ? `FL EK-0${int(calendarExam.order) - int(fullLengthIndexCorrection)}` : 'EK-1.5' // FL or HL exams
}

const shouldExamBeLockedInFreeTrial = async (studentCourse: StudentCourse, calendarExam, studentExam) => {
  if (studentCourse.type !== 'free_trial') {
    return false
  }

  const attachedExam = await findAttachedExam({ attached_id: studentCourse.book_course_id, exam_id: calendarExam.exam_id })

  if (!attachedExam) {
    return true
  }

  const studentAttachedExam = await findAttachedExamWithBookChapter(studentExam.id, studentCourse.id)

  if (!studentAttachedExam) {
    return true
  }

  // @ts-ignore
  return !(attachedExam.is_free_trial || studentAttachedExam.is_free_trial_chapter)
}

const findFirstSection = R.find(
  R.propEq('order', 1)
)

const createEventForExam = async (calendarExam, studentExams, studentCourse, eventDate: Moment, prioridays: number[] = [], isArchived = false) => {
  const studentExam = studentExams.find(studentExam => studentExam.exam_id === calendarExam.exam_id)

  if (!studentExam) {
    console.log(`Did not find student exam for (original) exam ID ${calendarExam.exam_id}`)

    return
  }

  if (studentCourse.type !== StudentCourseTypes.freeTrial && studentExam.is_free_trail) {
    console.log(`Student exam ${studentExam.id} should be present only in free trial course`)

    return
  }

  const examLength = getExamLength(studentExam)
  const reviewVideoId = R.path(['originalExam', 'review_video_id'])(studentExam)
  const allMatchingStudentExams = findAllMatchingStudentExamIds(studentExam.exam_id)(studentExams)

  if (examLength !== 375) {
    fullLengthIndexCorrection++
  }

  const isLockedInFreeTrial = await shouldExamBeLockedInFreeTrial(studentCourse, calendarExam, studentExam)

  if (!eventDate) {
    console.log(`WARNING: No event date found for exam ${studentExam.id} (original exam ID ${calendarExam.exam_id}), adding to archive`)

    await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExam : CalendarEventType.otherExam, {
      title: getTitle(examLength, calendarExam, studentExam),
      event_date: moment().format(DATE_FORMAT_YMD),
      duration: examLength,
      action_uri: `/exam/${studentExam.id}`,
      event_colour: '?',
      student_item_id: studentExam.id,
      original_exam_id: studentExam.exam_id,
      student_exam_ids: allMatchingStudentExams,
      from_manual_setup: isArchived,
      status: CalendarEventStatus.archived,
      is_locked_in_free_trial: isLockedInFreeTrial,
      free_trial_featured_exam: studentExam.free_trial_featured_exam,
    })

    /**
     * Check if a review for given course and student exam id is present - if so, skip
     * This is to prevent duplicate reviews from being created (e.g. the review is archived, but the exam is "incomplete", hence a duplicate review is created)
     */
    const existingReview = await findcalendarEvent({ student_course_id: studentCourse.id, student_exam_id: studentExam.id, type: CalendarEventType.otherExamReview })

    if (existingReview) {
      return
    }

    // const firstSection = findFirstSection(studentExam.sections) - unused due to review routing change

    // Also create a review scheduled for next day
    await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExamReview : CalendarEventType.otherExamReview, {
      title: getTitle(examLength, calendarExam, studentExam),
      event_date: getNextDayOfWeek(moment().format(DATE_FORMAT_YMD), findReviewDayNumber(prioridays)).format(DATE_FORMAT_YMD),
      duration: examLength,
      // action_uri: reviewVideoId ? `/videos/${reviewVideoId}` : '', // Jon decided to redirect the student to diagnostics because of lack of videos
      action_uri: `/exam/${studentExam.id}/score-report/score-sheet`,
      event_colour: '?',
      student_exam_id: studentExam.id,
      student_exam_ids: allMatchingStudentExams,
      from_manual_setup: isArchived,
      status: CalendarEventStatus.archived,
      is_locked_in_free_trial: isLockedInFreeTrial,
      free_trial_featured_exam: studentExam.free_trial_featured_exam,
    })

    return
  }

  await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExam : CalendarEventType.otherExam, {
    title: getTitle(examLength, calendarExam, studentExam),
    event_date: eventDate.format(DATE_FORMAT_YMD),
    duration: examLength,
    action_uri: `/exam/${studentExam.id}`,
    event_colour: '?',
    student_item_id: studentExam.id,
    original_exam_id: studentExam.exam_id,
    student_exam_ids: allMatchingStudentExams,
    from_manual_setup: isArchived,
    status: isArchived ? CalendarEventStatus.archived : CalendarEventStatus.incomplete,
    is_locked_in_free_trial: isLockedInFreeTrial,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  })

  /**
   * Check if a review for given course and student exam id is present - if so, skip
   * This is to prevent duplicate reviews from being created (e.g. the review is archived, but the exam is "incomplete", hence a duplicate review is created)
   */
  const existingReview = await findcalendarEvent({ student_course_id: studentCourse.id, student_exam_id: studentExam.id })

  if (existingReview) {
    return
  }

  // const firstSection = findFirstSection(studentExam.sections) - unused due to review routing change

  // Also create a review scheduled for next day
  await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExamReview : CalendarEventType.otherExamReview, {
    title: getTitle(examLength, calendarExam, studentExam),
    event_date: getNextDayOfWeek(eventDate.clone().format(DATE_FORMAT_YMD), findReviewDayNumber(prioridays)).format(DATE_FORMAT_YMD),
    duration: examLength,
    // action_uri: reviewVideoId ? `/videos/${reviewVideoId}` : '', // Jon decided to redirect the student to diagnostics because of lack of videos
    action_uri: `/exam/${studentExam.id}/score-report/score-sheet`,
    event_colour: '?',
    student_exam_id: studentExam.id,
    student_exam_ids: allMatchingStudentExams,
    from_manual_setup: isArchived,
    status: isArchived ? CalendarEventStatus.archived : CalendarEventStatus.incomplete,
    is_locked_in_free_trial: isLockedInFreeTrial,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  })
}

const findReviewDayNumber = R.indexOf(7)

const getNextDayOfWeek = (dateString: string, targetDayOfWeek: number): Moment => {
  const date = new Date(dateString)
  const currentDayOfWeek = date.getDay() // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const daysUntilTarget = (targetDayOfWeek - currentDayOfWeek + 7) % 7 // Calculate the number of days until the target day
  const nextTargetDay = new Date(date.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000) // Add the number of days to the current date

  return moment(nextTargetDay)
}

const buildCalendarEvents = async (eventSchedule: EventScheduleTask[], studentCourse: StudentCourse, calendarFullExams, studentExams, checkForSkippedOrComplete = false, prioridays: number[] = [], isArchived = false) => {
  const availableDate = eventSchedule.shift()

  if (!availableDate) {
    console.log('No available event date found (FL exam) even for the first exam! Adding exam to archive')

    await createEventForExam(calendarFullExams.shift(), studentExams, studentCourse, moment(), prioridays, true)

    return
  }

  if (checkForSkippedOrComplete) {
    let existingEvent

    const studentExam = studentExams.find(studentExam => studentExam.exam_id === calendarFullExams[0].exam_id)

    if (studentExam) {
      existingEvent = await findEventByStudentItemId(studentCourse.id, studentExam.id)
    }

    // Do not create event if it already exists
    if (!existingEvent) {
      // First exam should take place right after the course start date
      await createEventForExam(calendarFullExams.shift(), studentExams, studentCourse, availableDate.date, prioridays, isArchived)
    }
  } else {
    console.log('CRETE FIRST EXAM')
    // First exam should take place right after the course start date
    await createEventForExam(calendarFullExams.shift(), studentExams, studentCourse, availableDate.date, prioridays, isArchived)
  }

  await forEachP(
    async calendarExam => {
      if (checkForSkippedOrComplete) {
        const studentExam = studentExams.find(studentExam => studentExam.exam_id === calendarExam.exam_id)

        if (!studentExam) {
          return
        }

        const existingEvent = await findEventByStudentItemId(studentCourse.id, studentExam.id)

        // Do not create event if it already exists
        if (existingEvent) {
          return
        }
      }

      const eventScheduleItem = eventSchedule.shift()

      if (!eventScheduleItem) {
        console.log('No available event date found (FL exam)')

        return
      }

      const eventDate = eventScheduleItem.date

      await createEventForExam(calendarExam, studentExams, studentCourse, eventDate, prioridays, isArchived)
    }
  )(calendarFullExams)
}

export const buildFullExamEvents = async (eventSchedule: EventScheduleTask[], studentCourse: StudentCourse, checkForSkippedOrComplete = false, prioridays: number[] = [], isArchived = false) => {
  const calendarFullExams = await getCalendarFullExams(studentCourse)
  const studentExams = await fetchStudentExams(studentCourse)

  console.log('CAL FULL EXAMS', calendarFullExams)

  fullLengthIndexCorrection = 0

  await buildCalendarEvents(eventSchedule, studentCourse, calendarFullExams, studentExams, checkForSkippedOrComplete, prioridays, isArchived)
}
