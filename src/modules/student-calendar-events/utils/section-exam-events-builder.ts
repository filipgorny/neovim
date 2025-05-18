import * as R from 'ramda'
import moment from 'moment'
import { find as findExams } from '../../student-exams/student-exam-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find as findCalendarSectionExams } from '../../calendar-section-exams/calendar-section-exams-repository'
import { StudentCourse } from '../../../types/student-course'
import { CalendarEventType } from '../calendar-event-type'
import { createCalendarEvent } from '../student-calendar-events-service'
import { DATE_FORMAT_YMD } from '../../../constants'
import forEachP from '../../../../utils/function/foreachp'
import { findOne as findCalendarSettings } from '../../calendar-settings/calendar-settings-repository'
import { CalendarExamFrequency } from '../../calendar-settings/calendar-exam-frequency'
import { getExamLength } from '../../exams/exam-length-service'
import { AvailableDateFactory } from './available-date-factory'
import { findEventByStudentItemId } from '../student-calendar-events-repository'
import { findAllMatchingStudentExamIds } from './find-all-matching-student-exam-ids'
import { StudentCourseTypes } from '../../student-courses/student-course-types'

const timestampFromDate = date => (new Date(date)).getTime()

const fetchStudentExams = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findExams({ limit: { page: 1, take: 1000 }, order: { by: 'title', dir: 'asc' } }, { student_id: studentCourse.student_id }, ['originalExam']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const getCalendarSectionExams = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findCalendarSectionExams({ limit: { page: 1, take: 1000 }, order: { by: 'order', dir: 'asc' } }, { course_id: studentCourse.book_course_id }),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const findLastDayOfWeek = (startDate: Date, endDate: Date, dayOfWeek: number): string => {
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)')
  }

  const lastDay = new Date(endDate.getTime())
  const currentDayOfWeek = lastDay.getDay()
  let daysToLastDesiredDay = currentDayOfWeek - dayOfWeek

  if (daysToLastDesiredDay < 0) {
    daysToLastDesiredDay += 7 // Go back one week
  }

  lastDay.setDate(lastDay.getDate() - daysToLastDesiredDay)

  if (lastDay < startDate) {
    return 'No such day in the given period'
  }

  return lastDay.toISOString().slice(0, 10)
}

const createEventForExam = async (calendarExam, studentExams, studentCourse, eventDate, dateFactory: AvailableDateFactory) => {
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

  await createCalendarEvent(studentCourse, CalendarEventType.sectionExam, {
    title: `EK-S${calendarExam.order}`,
    event_date: eventDate.format(DATE_FORMAT_YMD),
    duration: examLength,
    action_uri: `/exam/${studentExam.id}`,
    event_colour: '???',
    student_item_id: studentExam.id,
    original_exam_id: studentExam.exam_id,
    student_exam_ids: allMatchingStudentExams,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  })

  // Also create a review scheduled for next day
  await createCalendarEvent(studentCourse, CalendarEventType.sectionExamReview, {
    title: `EK-S${calendarExam.order}`,
    event_date: eventDate.clone().add(1, 'days').format(DATE_FORMAT_YMD),
    duration: examLength,
    action_uri: reviewVideoId ? `/videos/${reviewVideoId}` : '',
    event_colour: '???',
    student_exam_id: studentExam.id,
    student_exam_ids: allMatchingStudentExams,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  })

  dateFactory.addEventToDate(eventDate)
}

const getSpecificDates = (startDate: string, endDate: string, weekdays: number[], daysOff, studentDaysOff, excludeEveryOtherWeek: boolean = false) => {
  const dates = []
  let weekCounter = 1

  for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
    if (weekdays.includes(d.getDay()) && (timestampFromDate(moment(d).format(DATE_FORMAT_YMD)) < daysOff.beginningOfWeekTimeStamp || timestampFromDate(moment(d).format(DATE_FORMAT_YMD)) > daysOff.endOfWeekTimeStamp) && !studentDaysOff.includes(moment(d).format(DATE_FORMAT_YMD))) {
      if (!excludeEveryOtherWeek || weekCounter % 2 !== 0) {
        dates.push(moment(d))
      }
      weekCounter++
    }
  }

  return dates
}

const buildCalendarEvents = async (studentCourse: StudentCourse, daysOff, calendarSectionExams, studentExams, studentDaysOff, dateFactory: AvailableDateFactory, checkForSkippedOrComplete = false) => {
  const calendarSettings = await findCalendarSettings({ course_id: studentCourse.book_course_id })
  const lastExamDate = findLastDayOfWeek(new Date(studentCourse.calendar_start_at), new Date(studentCourse.exam_at), R.last(calendarSettings.preferred_days_section_exam))

  const specificDates = getSpecificDates(studentCourse.calendar_start_at, lastExamDate, calendarSettings.preferred_days_section_exam, daysOff, studentDaysOff, calendarSettings.section_exam_frequency === CalendarExamFrequency.everyOtherWeek)

  console.log('Section exam allowed dates: ', specificDates)

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

      let eventDate = specificDates.pop()

      if (!eventDate) {
        eventDate = dateFactory.getAvailableDate()

        console.log('No available event date found (SECTIONAL), make one from factory', eventDate)
      }

      await createEventForExam(calendarExam, studentExams, studentCourse, eventDate, dateFactory)
    }
  )(calendarSectionExams)
}

export const buildSectionExamEvents = async (studentCourse: StudentCourse, daysOff, studentDaysOff, dateFactory: AvailableDateFactory, checkForSkippedOrComplete = false) => {
  const calendarSectionExams = await getCalendarSectionExams(studentCourse)
  const studentExams = await fetchStudentExams(studentCourse)

  await buildCalendarEvents(studentCourse, daysOff, calendarSectionExams, studentExams, studentDaysOff, dateFactory, checkForSkippedOrComplete)
}
