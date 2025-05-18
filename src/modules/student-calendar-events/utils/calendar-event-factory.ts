import * as R from 'ramda'
import moment from 'moment'
import { StudentCourse } from '../../../types/student-course'
import { CalendarEventType } from '../calendar-event-type'
import { createCalendarEvent } from '../student-calendar-events-service'
import { findAllMatchingStudentExamIds } from './find-all-matching-student-exam-ids'
import { findOne as findStudentExam, find as findExams } from '../../student-exams/student-exam-repository'
import { findOne as findCustomEventType } from '../../custom-event-types/custom-event-types-repository'
import { findOne as findCourseEndDateDay } from '../../course-end-date-days/course_end_date_days-repository'
import { findOneOrFail as findStudentBookChapter } from '../../student-book-chapters/student-book-chapter-repository'
import { findOneOrFail as findBookChapter } from '../../book-chapters/book-chapter-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { DATE_FORMAT_YMD } from '../../../constants'
import { calculateChapterTime } from '../../book-chapters/helpers/calculate-chapter-time'
import { calculateClassDuration } from './calculate-class-duration'

type FullLengthExamEventPayload = {
  title: string,
  event_date: string,
  exam_id: string,
  status?: string,
}

type SectionalExamEventPayload = {
  title: string,
  event_date: string,
  exam_id: string,
  status?: string,
}

type CustomEventTypeEventPayload = {
  title: string,
  event_date: string,
  custom_event_type_id: string,
  status?: string,
}

type CustomEventPayload = {
  title: string,
  event_date: string,
  duration: number,
  description?: string,
  status?: string,
}

type ChapterReadingEventPayload = {
  title: string,
  event_date: string,
  student_book_chapter_id: string,
  status?: string,
}

type ChapterExamEventPayload = {
  title: string,
  event_date: string,
  exam_id: string,
  status?: string,
}

type CustomLiveClassEventPayload = {
  student_book_chapter_id: string,
  course_end_date_day_id: string,
  parent_event_id: string,
}

const fetchStudentExams = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findExams({ limit: { page: 1, take: 1000 }, order: { by: 'title', dir: 'asc' } }, { student_id: studentCourse.student_id }, ['originalExam']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const createFullLengthExamEvent = async (studentCourse: StudentCourse, payload: FullLengthExamEventPayload) => {
  const studentExam = await findStudentExam({ student_id: studentCourse.student_id, exam_id: payload.exam_id }, ['originalExam'])

  if (!studentExam) {
    console.log(`Student exam not found (original exam ID ${payload.exam_id}) for full length exam`)

    return []
  }

  const studentExams = await fetchStudentExams(studentCourse)
  const allMatchingStudentExams = findAllMatchingStudentExamIds(studentExam.exam_id)(studentExams)
  const reviewVideoId = R.path(['originalExam', 'review_video_id'])(studentExam)

  const eventA = await createCalendarEvent(studentCourse, CalendarEventType.customFullLengthExam, {
    title: payload.title,
    event_date: payload.event_date,
    duration: studentExam.exam_length.summary.minutes,
    action_uri: `/exams/${studentExam.id}`,
    event_colour: '???',
    student_item_id: studentExam.id,
    original_exam_id: studentExam.exam_id,
    student_exam_ids: allMatchingStudentExams,
    status: payload.status,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  }, true)

  const eventB = await createCalendarEvent(studentCourse, CalendarEventType.customFullLengthExamReview, {
    title: payload.title,
    event_date: moment(payload.event_date).add(1, 'days').format(DATE_FORMAT_YMD),
    duration: studentExam.exam_length.summary.minutes,
    action_uri: reviewVideoId ? `/videos/${reviewVideoId}` : '',
    event_colour: '???',
    student_item_id: studentExam.id,
    student_exam_ids: allMatchingStudentExams,
    status: payload.status,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  }, true)

  return [eventA, eventB]
}

const createSectionalExamEvent = async (studentCourse: StudentCourse, payload: SectionalExamEventPayload) => {
  const studentExam = await findStudentExam({ student_id: studentCourse.student_id, exam_id: payload.exam_id }, ['originalExam'])

  if (!studentExam) {
    console.log(`Student exam not found (original exam ID ${payload.exam_id}) for sectional exam`, payload)

    return []
  }

  const studentExams = await fetchStudentExams(studentCourse)
  const allMatchingStudentExams = findAllMatchingStudentExamIds(studentExam.exam_id)(studentExams)
  const reviewVideoId = R.path(['originalExam', 'review_video_id'])(studentExam)

  const eventA = await createCalendarEvent(studentCourse, CalendarEventType.customSectionExam, {
    title: payload.title,
    event_date: payload.event_date,
    duration: studentExam.exam_length.summary.minutes,
    action_uri: `/exams/${studentExam.id}`,
    event_colour: '???',
    student_item_id: studentExam.id,
    original_exam_id: studentExam.exam_id,
    student_exam_ids: allMatchingStudentExams,
    status: payload.status,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  }, true)

  const eventB = await createCalendarEvent(studentCourse, CalendarEventType.customSectionExamReview, {
    title: payload.title,
    event_date: payload.event_date,
    duration: studentExam.exam_length.summary.minutes,
    action_uri: reviewVideoId ? `/videos/${reviewVideoId}` : '',
    event_colour: '???',
    student_item_id: studentExam.id,
    student_exam_ids: allMatchingStudentExams,
    status: payload.status,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  }, true)

  return [eventA, eventB]
}

const createCustomEventTypeEvent = async (studentCourse: StudentCourse, payload: CustomEventTypeEventPayload) => {
  const customEventType = await findCustomEventType({ id: payload.custom_event_type_id }, ['customEventGroup'])

  return createCalendarEvent(studentCourse, CalendarEventType.customEventType, {
    title: payload.title,
    event_date: payload.event_date,
    duration: 375,
    action_uri: customEventType.customEventGroup.slug + '__' + customEventType.slug,
    event_colour: '???',
    student_item_id: payload.custom_event_type_id,
    student_exam_ids: null,
    status: payload.status,
  }, true)
}

const createCustomEvent = async (studentCourse: StudentCourse, payload: CustomEventPayload) => {
  return createCalendarEvent(studentCourse, CalendarEventType.custom, {
    title: payload.title,
    event_date: payload.event_date,
    duration: payload.duration,
    description: payload.description,
    action_uri: '',
    event_colour: '???',
    student_item_id: null,
    student_exam_ids: null,
    status: payload.status,
  }, true)
}

const getActionUri = (originalChapter) => (
  `/books/${originalChapter.book_id}/chapter/${originalChapter.order}/part/1`
)

const createChapterReadingEvent = async (studentCourse: StudentCourse, payload: ChapterReadingEventPayload) => {
  const chapter = await findStudentBookChapter({ id: payload.student_book_chapter_id }, ['book.book'])
  const originalChapter = await findBookChapter({ id: chapter.original_chapter_id }, ['subchapters.contents'])

  return createCalendarEvent(studentCourse, CalendarEventType.bookLink, {
    title: payload.title,
    event_date: payload.event_date,
    duration: calculateChapterTime(originalChapter),
    action_uri: getActionUri(originalChapter),
    event_colour: chapter.book.book.tag_colour,
    student_item_id: payload.student_book_chapter_id,
    student_exam_ids: null,
    status: payload.status,
  }, true)
}

const createChapterExamEvent = async (studentCourse: StudentCourse, payload: ChapterExamEventPayload) => {
  const studentExam = await findStudentExam({ student_id: studentCourse.student_id, id: payload.exam_id }, ['originalExam'])

  const studentExams = await fetchStudentExams(studentCourse)
  const allMatchingStudentExams = findAllMatchingStudentExamIds(studentExam.exam_id)(studentExams)
  const reviewVideoId = R.path(['originalExam', 'review_video_id'])(studentExam)

  const eventA = await createCalendarEvent(studentCourse, CalendarEventType.chapterExam, {
    title: payload.title,
    event_date: payload.event_date,
    duration: studentExam.exam_length.summary.minutes,
    action_uri: `/exams/${studentExam.id}`,
    event_colour: '???',
    student_item_id: studentExam.id,
    student_exam_ids: null,
    status: payload.status,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  }, true)

  const eventB = await createCalendarEvent(studentCourse, CalendarEventType.chapterExamReview, {
    title: payload.title + ' - review',
    event_date: payload.event_date,
    duration: studentExam.exam_length.summary.minutes,
    action_uri: reviewVideoId ? `/videos/${reviewVideoId}` : '',
    event_colour: '???',
    student_item_id: studentExam.id,
    student_exam_ids: allMatchingStudentExams,
    status: payload.status,
    free_trial_featured_exam: studentExam.free_trial_featured_exam,
  }, true)

  return [eventA, eventB]
}

const getCustomLiveClassActionUri = (studentChapter, meetingUrl?: string) => {
  if (meetingUrl) {
    return meetingUrl
  }

  return `/books/${studentChapter.original_book_id}/chapter/${studentChapter.order}/part/1`
}

const createCustomLiveClassEvent = async (studentCourse: StudentCourse, payload: CustomLiveClassEventPayload) => {
  const chapter = await findStudentBookChapter({ id: payload.student_book_chapter_id }, ['book.book'])
  const classDay = await findCourseEndDateDay({ id: payload.course_end_date_day_id })

  return createCalendarEvent(studentCourse, CalendarEventType.customLiveClass, {
    title: `${chapter.book.tag}_${chapter.order}`,
    event_date: classDay.class_date,
    duration: calculateClassDuration(classDay),
    action_uri: getCustomLiveClassActionUri(chapter, classDay.meeting_url),
    event_colour: chapter.book.tag_colour,
    student_item_id: payload.student_book_chapter_id,
    class_time: classDay.class_time,
    class_time_end: classDay.class_time_end,
    student_exam_ids: payload.course_end_date_day_id, // This is being used for marking given class day as selected
    parent_event_id: payload.parent_event_id,
  }, true)
}

const factories = {
  [CalendarEventType.bookLink]: createChapterReadingEvent,
  [CalendarEventType.chapterExam]: createChapterExamEvent,
  [CalendarEventType.fullLengthExam]: createFullLengthExamEvent,
  [CalendarEventType.sectionExam]: createSectionalExamEvent,
  [CalendarEventType.customEventType]: createCustomEventTypeEvent,
  [CalendarEventType.custom]: createCustomEvent,
  [CalendarEventType.customLiveClass]: createCustomLiveClassEvent,
}

export const getEventFactoryByEventType = (eventType: CalendarEventType) => (
  factories[eventType]
)
