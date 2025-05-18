import * as R from 'ramda'
import moment from 'moment'
import { int } from '@desmart/js-utils'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { StudentCourse } from '../../../types/student-course'
import { findOneOrFail as findEndDate } from '../../course-end-dates/course-end-dates-repository'
import { findOne as findCalendarSettings } from '../../calendar-settings/calendar-settings-repository'
import { CalendarSettings } from '../../../types/calendar-settings'
import forEachP from '../../../../utils/function/foreachp'
import { createCalendarEvent } from '../student-calendar-events-service'
import { CalendarEventType } from '../calendar-event-type'
import { calculateChapterTime } from '../../book-chapters/helpers/calculate-chapter-time'
import { DATE_FORMAT_YMD } from '../../../constants'
import { findOneOrFail as findChapter } from '../../book-chapters/book-chapter-repository'
import { handleChapterExam } from '../utils/chapter-exam-events-builder'
import { getExamLength } from '../../exams/exam-length-service'
import { findAllMatchingStudentExamIds } from '../utils/find-all-matching-student-exam-ids'
import { findEventByStudentExamId, findEventByStudentItemId } from '../student-calendar-events-repository'
import { CalendarEventStatus } from '../calendar-event-status'
import { transformStudentChaptersForLiveClass } from '../utils/transform-student-chapters'
import { ClassDay } from '../../../types/class-day'
import { calculateClassDuration } from '../utils/calculate-class-duration'
import { extractClassDays, extractExamDays, fetchStudentBooks, fetchStudentExams, getActionUri, getCalendarEventTitle, getEventColour } from '../utils/live-class-utils'
import { findDaysByCourseEndDateId } from '../../course-end-date-days/course_end_date_days-repository'

let fullLengthIndexCorrection = 0
let fullLengthCounter = 1

const createChapterReadingEvent = async (studentCourse: StudentCourse, studentChapters, classDay, eventDate, checkForSkippedOrComplete = false) => {
  const extractBy = R.pipe(
    R.pluck('originalContent'),
    R.flatten,
    R.pluck('content_html')
  )

  const eventPayload = {
    title: getCalendarEventTitle(classDay.book_chapter_id, studentChapters),
    event_date: moment(eventDate).subtract(1, 'days').format(DATE_FORMAT_YMD),
    duration: calculateChapterTime(studentChapters[classDay.book_chapter_id], extractBy),
    action_uri: getActionUri(classDay.book_chapter_id, studentChapters),
    event_colour: getEventColour(classDay.book_chapter_id, studentChapters),
    student_item_id: studentChapters[classDay.book_chapter_id].student_book_chapter_id,
  }

  if (checkForSkippedOrComplete) {
    const existingEvent = await findEventByStudentItemId(studentCourse.id, studentChapters[classDay.book_chapter_id].student_book_chapter_id)

    // Do not create event if it already exists
    if (existingEvent && existingEvent.status !== CalendarEventStatus.incomplete) {
      console.log('Event already exists for student item', studentChapters[classDay.book_chapter_id].student_book_chapter_id)
    } else {
      await createCalendarEvent(studentCourse, CalendarEventType.bookLink, eventPayload)
    }
  } else {
    await createCalendarEvent(studentCourse, CalendarEventType.bookLink, eventPayload)
  }
}

const buildCalendarEvents = async (classDays: ClassDay[], studentCourse: StudentCourse, studentChapters, calendarSettings: CalendarSettings, checkForSkippedOrComplete = false) => {
  await forEachP(
    async (classDay: ClassDay) => {
      if (!studentChapters[classDay.book_chapter_id]) {
        console.log('No student chapter found for calendar chapter', classDay.book_chapter_id)

        return
      }

      const eventDate = classDay.class_date

      await createChapterReadingEvent(studentCourse, studentChapters, classDay, eventDate, checkForSkippedOrComplete)

      await createCalendarEvent(studentCourse, CalendarEventType.liveClass, {
        title: getCalendarEventTitle(classDay.book_chapter_id, studentChapters),
        event_date: moment(eventDate).format(DATE_FORMAT_YMD),
        duration: calculateClassDuration(classDay),
        action_uri: getActionUri(classDay.book_chapter_id, studentChapters, classDay.meeting_url),
        event_colour: getEventColour(classDay.book_chapter_id, studentChapters),
        student_item_id: studentChapters[classDay.book_chapter_id].student_book_chapter_id,
        class_time: classDay.class_time,
        class_time_end: classDay.class_time_end,
        student_exam_ids: classDay.id, // This is being used for marking given class day as selected
      })

      const chapter = await findChapter({ id: classDay.book_chapter_id }, ['attached'])

      // Create chapter exam and review, if needed
      await handleChapterExam({ chapter, chapter_id: chapter.id }, studentCourse, studentChapters, moment(eventDate), calendarSettings, false, false, false, checkForSkippedOrComplete)
    }
  )(classDays)
}

const getTitle = (examLength, calendarExam, studentExam) => {
  if (studentExam.originalExam.custom_title) {
    return studentExam.originalExam.custom_title
  }

  return examLength === 375 ? `FL EK-0${int(calendarExam.order) - int(fullLengthIndexCorrection)}` : 'EK-1.5' // FL or HL exams
}

const createEventForExam = async (classDay: ClassDay, studentExams, studentCourse, checkForSkippedOrComplete = false) => {
  const studentExam = studentExams.find(studentExam => studentExam.exam_id === classDay.exam_id)

  if (!studentExam) {
    console.log(`Did not find student exam for (original) exam ID ${classDay.exam_id}`)

    return
  }

  const examLength = getExamLength(studentExam)
  const reviewVideoId = R.path(['originalExam', 'review_video_id'])(studentExam)
  const allMatchingStudentExams = findAllMatchingStudentExamIds(studentExam.exam_id)(studentExams)

  if (examLength !== 375) {
    fullLengthIndexCorrection++
  }

  const eventDate = moment(classDay.class_date)

  const examPayload = {
    title: getTitle(examLength, studentExam, studentExam),
    event_date: eventDate.format(DATE_FORMAT_YMD),
    duration: examLength,
    action_uri: `/exam/${studentExam.id}`,
    event_colour: '???',
    student_item_id: studentExam.id,
    student_exam_ids: allMatchingStudentExams,
  }

  if (checkForSkippedOrComplete) {
    const existingEvent = await findEventByStudentItemId(studentCourse.id, studentExam.id)

    // Do not create event if it already exists
    if (existingEvent && existingEvent.status !== CalendarEventStatus.incomplete) {
      console.log('Event already exists for student item', studentExam.id)
    } else {
      await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExam : CalendarEventType.otherExam, examPayload)
    }
  } else {
    await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExam : CalendarEventType.otherExam, examPayload)
  }

  const examReviewPayload = {
    title: getTitle(examLength, studentExam, studentExam),
    event_date: eventDate.clone().add(1, 'days').format(DATE_FORMAT_YMD),
    duration: examLength,
    action_uri: reviewVideoId ? `/videos/${reviewVideoId}` : '',
    event_colour: '???',
    student_exam_id: studentExam.id,
    student_exam_ids: allMatchingStudentExams,
  }

  if (checkForSkippedOrComplete) {
    const existingEvent = await findEventByStudentExamId(studentCourse.id, studentExam.id)

    // Do not create event if it already exists
    if (existingEvent && existingEvent.status !== CalendarEventStatus.incomplete) {
      console.log('Event already exists for student item', studentExam.id)
    } else {
      await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExamReview : CalendarEventType.otherExamReview, examReviewPayload)
    }
  } else {
    await createCalendarEvent(studentCourse, examLength === 375 ? CalendarEventType.fullLengthExamReview : CalendarEventType.otherExamReview, examReviewPayload)
  }

  fullLengthCounter++
}

const buildExamCalendarEvents = async (classDays: ClassDay[], studentCourse: StudentCourse, studentExams, checkForSkippedOrComplete = false) => {
  await forEachP(
    async (classDay: ClassDay) => {
      await createEventForExam(classDay, studentExams, studentCourse, checkForSkippedOrComplete)
    }
  )(classDays)
}

const createCustomEndDateEvents = async (studentCourse: StudentCourse) => {
  const days = await findDaysByCourseEndDateId(studentCourse.end_date_id)

  return mapP(
    async (day: ClassDay) => {
      return createCalendarEvent(studentCourse, CalendarEventType.customEndDateEvent, {
        title: day.custom_title,
        event_date: day.class_date,
        duration: calculateClassDuration(day),
        action_uri: day.meeting_url,
        class_time: day.class_time,
        class_time_end: day.class_time_end,
        event_colour: JSON.stringify({ fill_colour_start: day.fill_colour_start, fill_colour_stop: day.fill_colour_stop, font_colour: day.font_colour }),
      })
    }
  )(days)
}

export default async (studentCourse: StudentCourse, checkForSkippedOrComplete = false) => {
  const endDate = await findEndDate({ id: studentCourse.end_date_id }, ['days'])
  const calendarSettings = await findCalendarSettings({ course_id: studentCourse.book_course_id })

  const [books, studentExams] = await Promise.all([
    fetchStudentBooks(studentCourse),
    fetchStudentExams(studentCourse),
  ])

  fullLengthCounter = 1

  // Student chapters mapped to reflect the calendar chapters (we have to create links to student books)
  const studentChapters = transformStudentChaptersForLiveClass(books)

  const classDays = extractClassDays(endDate)
  const examDays = extractExamDays(endDate)

  fullLengthIndexCorrection = 0

  await buildCalendarEvents(classDays, studentCourse, studentChapters, calendarSettings, checkForSkippedOrComplete)

  console.log('DONE WITH CLASS DAYS')

  await buildExamCalendarEvents(examDays, studentCourse, studentExams, checkForSkippedOrComplete)

  console.log('DONE WITH EXAM DAYS')

  await createCustomEndDateEvents(studentCourse)

  return endDate
}
