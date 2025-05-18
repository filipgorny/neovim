import * as R from 'ramda'
import moment from 'moment'
import { find as findBooks } from '../../student-books/student-book-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find as findCalendarChapters } from '../../calendar-chapters/calendar-chapters-repository'
import { StudentCourse } from '../../../types/student-course'
import { CalendarEventType } from '../calendar-event-type'
import { createCalendarEvent } from '../student-calendar-events-service'
import { DATE_FORMAT_YMD } from '../../../constants'
import forEachP from '../../../../utils/function/foreachp'
import { findOne as findCalendarSettings } from '../../calendar-settings/calendar-settings-repository'
import { handleChapterExam } from './chapter-exam-events-builder'
import { CalendarSettings } from '../../../types/calendar-settings'
import { calculateChapterTime } from '../../book-chapters/helpers/calculate-chapter-time'
import { findEventByStudentItemId, findEventByStudentItemIdForPreReading } from '../student-calendar-events-repository'
import { EventScheduleTask } from '../../../../services/student-calendar-events/schedule-events-coles-algorithm'
import { CalendarEventStatus } from '../calendar-event-status'
import { transformStudentChapters } from './transform-student-chapters'
import { findOne as findCourseBook } from '../../course-books/course-book-repository'

const fetchStudentBooks = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findBooks({ limit: { page: 1, take: 100 }, order: { by: 'title', dir: 'asc' } }, { course_id: studentCourse.id }, ['chapters']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const getCalendarChapters = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findCalendarChapters({ limit: { page: 1, take: 1000 }, order: { by: 'order', dir: 'asc' } }, { course_id: studentCourse.book_course_id }, ['chapter.book', 'chapter.attached', 'chapter.subchapters.contents']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const getCalendarEventTitle = (calendarChapter, studentChapters) => (
  studentChapters[calendarChapter.chapter_id] ? `${studentChapters[calendarChapter.chapter_id].tag}_${calendarChapter.chapter.order}` : '?'
)

const getActionUri = (calendarChapter, studentChapters) => (
  studentChapters[calendarChapter.chapter_id] ? `/books/${studentChapters[calendarChapter.chapter_id].original_book_id}/chapter/${calendarChapter.chapter.order}/part/1` : '?'
)

const getEventColour = (calendarChapter, studentChapters) => (
  studentChapters[calendarChapter.chapter_id] ? studentChapters[calendarChapter.chapter_id].tag_colour : ''
)

const shouldChapterBeLockedInFreeTrial = async (studentCourse: StudentCourse, calendarChapter) => {
  const courseBook = await findCourseBook({ course_id: studentCourse.book_course_id, book_id: calendarChapter.chapter.book_id })

  return studentCourse.type === 'free_trial' && (!courseBook.is_free_trial || calendarChapter.chapter.order !== 1)
}

const buildCalendarEvents = async (eventSchedule: EventScheduleTask[], studentCourse: StudentCourse, calendarChapters, studentChapters, calendarSettings: CalendarSettings, checkForSkippedOrComplete = false, isArchived = false, skipExams = false, isPreReading = false) => {
  await forEachP(
    async calendarChapter => {
      if (!studentChapters[calendarChapter.chapter_id]) {
        console.log('No student chapter found for calendar chapter', calendarChapter)

        return
      }

      if (checkForSkippedOrComplete) {
        let existingEvent

        if (isPreReading) {
          existingEvent = await findEventByStudentItemIdForPreReading(studentCourse.id, studentChapters[calendarChapter.chapter_id].student_book_chapter_id)
        } else {
          existingEvent = await findEventByStudentItemId(studentCourse.id, studentChapters[calendarChapter.chapter_id].student_book_chapter_id)
        }

        // Do not create event if it already exists
        if ((!isPreReading && existingEvent && existingEvent.status !== CalendarEventStatus.incomplete) || (isPreReading && existingEvent && existingEvent.status !== CalendarEventStatus.incomplete && existingEvent.type === CalendarEventType.bookLinkPreReading)) {
          console.log('Event already exists for student item', studentChapters[calendarChapter.chapter_id].student_book_chapter_id)
          return
        }
      }

      const eventDateItem = eventSchedule.shift()
      const isLockedInFreeTrial = await shouldChapterBeLockedInFreeTrial(studentCourse, calendarChapter)

      if (!eventDateItem) {
        console.log('WARNING! No event date found for calendar chapter, adding to archive', calendarChapter.title)

        await createCalendarEvent(studentCourse, isPreReading ? CalendarEventType.bookLinkPreReading : CalendarEventType.bookLink, {
          title: getCalendarEventTitle(calendarChapter, studentChapters),
          event_date: moment().format(DATE_FORMAT_YMD),
          duration: calculateChapterTime(calendarChapter.chapter),
          action_uri: getActionUri(calendarChapter, studentChapters),
          event_colour: getEventColour(calendarChapter, studentChapters),
          student_item_id: studentChapters[calendarChapter.chapter_id].student_book_chapter_id,
          from_manual_setup: isArchived,
          status: CalendarEventStatus.archived,
          is_locked_in_free_trial: isLockedInFreeTrial,
        })

        await handleChapterExam(calendarChapter, studentCourse, studentChapters, moment(), calendarSettings, true, skipExams, isLockedInFreeTrial)

        return
      }

      const eventDate = eventDateItem.date

      await createCalendarEvent(studentCourse, isPreReading ? CalendarEventType.bookLinkPreReading : CalendarEventType.bookLink, {
        title: getCalendarEventTitle(calendarChapter, studentChapters),
        event_date: eventDate.format(DATE_FORMAT_YMD),
        duration: calculateChapterTime(calendarChapter.chapter),
        action_uri: getActionUri(calendarChapter, studentChapters),
        event_colour: getEventColour(calendarChapter, studentChapters),
        student_item_id: studentChapters[calendarChapter.chapter_id].student_book_chapter_id,
        from_manual_setup: isArchived,
        status: isArchived ? CalendarEventStatus.archived : CalendarEventStatus.incomplete,
        is_locked_in_free_trial: isLockedInFreeTrial,
      })

      // Create chapter exam and review, if needed
      await handleChapterExam(calendarChapter, studentCourse, studentChapters, eventDate, calendarSettings, isArchived, skipExams, isLockedInFreeTrial)
    }
  )(calendarChapters)
}

export const buildBookEvents = async (eventSchedule: EventScheduleTask[], studentCourse: StudentCourse, checkForSkippedOrComplete = false, forManualSetup = false, skipExams = false) => {
  const calendarSettings = await findCalendarSettings({ course_id: studentCourse.book_course_id })

  // Event schedule for the course
  const calendarChapters = await getCalendarChapters(studentCourse)

  const books = await fetchStudentBooks(studentCourse)

  // Student chapters mapped to reflect the calendar chapters (we have to create links to student books)
  const studentChapters = transformStudentChapters(books)

  await buildCalendarEvents(eventSchedule, studentCourse, calendarChapters, studentChapters, calendarSettings, checkForSkippedOrComplete, forManualSetup, skipExams)
}

export const buildBookEventsFromChapters = async (eventSchedule: EventScheduleTask[], calendarChapters, studentCourse: StudentCourse, checkForSkippedOrComplete = false, forManualSetup = false, isPreReading = false, skipExams = false) => {
  const calendarSettings = await findCalendarSettings({ course_id: studentCourse.book_course_id })

  const books = await fetchStudentBooks(studentCourse)

  // Student chapters mapped to reflect the calendar chapters (we have to create links to student books)
  const studentChapters = transformStudentChapters(books)

  await buildCalendarEvents(eventSchedule, studentCourse, calendarChapters, studentChapters, calendarSettings, checkForSkippedOrComplete, forManualSetup, skipExams, isPreReading)
}
