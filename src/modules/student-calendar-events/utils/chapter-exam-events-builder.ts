import * as R from 'ramda'
import { findOne as findCalendarChapterExam } from '../../calendar-chapter-exams/calendar-chapter-exams-repository'
import { findOne as findStudentAttachedExam } from '../../student-attached-exams/student-attached-exam-repository'
import { findOne as findcalendarEvent } from '../student-calendar-events-repository'
import { StudentCourse } from '../../../types/student-course'
import { CalendarEventType } from '../calendar-event-type'
import { createCalendarEvent } from '../student-calendar-events-service'
import { DATE_FORMAT_YMD } from '../../../constants'
import { CalendarSettings } from '../../../types/calendar-settings'
import { CalendarEventStatus } from '../calendar-event-status'

const getTitle = (studentChapters, calendarChapter, studentAttachedExam) => (
  // studentAttachedExam.exam.originalExam.custom_title ? studentAttachedExam.exam.originalExam.custom_title : `${studentChapters[calendarChapter.chapter_id].tag}_${calendarChapter.chapter.order}`
  `${studentChapters[calendarChapter.chapter_id].tag}_${calendarChapter.chapter.order}`
)

const findFirstSection = R.find(
  R.propEq('order', 1)
)

export const handleChapterExam = async (calendarChapter, studentCourse: StudentCourse, studentChapters, eventDate, calendarSettings: CalendarSettings, isArchived = false, skipExams = false, isLockedInFreeTrial = false, checkForSkippedOrComplete = false) => {
  if (skipExams) {
    return
  }

  if (calendarChapter.chapter.attached && !R.isEmpty(calendarChapter.chapter.attached)) {
    const calendarChapterExam = await findCalendarChapterExam({ course_id: studentCourse.book_course_id, exam_id: calendarChapter.chapter.attached.exam_id })

    // check if this exam is attached to the calendar
    if (calendarChapterExam) {
      const studentAttachedExam = await findStudentAttachedExam({ course_id: studentCourse.id, original_attached_id: calendarChapter.chapter.attached.attached_id }, ['exam.originalExam', 'exam.sections'])
      const reviewVideoId = R.path(['exam', 'originalExam', 'review_video_id'])(studentAttachedExam)
      const examLength = R.path(['exam', 'exam_length', 'summary', 'minutes'])(studentAttachedExam)

      if (!studentChapters[calendarChapter.chapter_id]) {
        console.error(`WARNING! Chapter ${calendarChapter.chapter_id} not found in student chapters`)

        return
      }

      // create the exam and review events
      if (studentAttachedExam) {
        /**
         * Check if a chapter exam for given course and student exam id is present - if so, skip
         * This is to prevent duplicate items from being created
         */
        const existingChapterExam = await findcalendarEvent({ student_course_id: studentCourse.id, student_item_id: studentAttachedExam.exam_id, type: CalendarEventType.chapterExam })

        if (!existingChapterExam) {
          await createCalendarEvent(studentCourse, CalendarEventType.chapterExam, {
            title: getTitle(studentChapters, calendarChapter, studentAttachedExam),
            description: studentAttachedExam.exam.originalExam.custom_title,
            event_date: eventDate.clone().format(DATE_FORMAT_YMD),
            duration: examLength,
            action_uri: `/exams/${studentAttachedExam.exam_id}`,
            event_colour: studentChapters[calendarChapter.chapter_id].tag_colour,
            student_item_id: studentAttachedExam.exam_id,
            from_manual_setup: isArchived,
            status: isArchived ? CalendarEventStatus.archived : CalendarEventStatus.incomplete,
            is_locked_in_free_trial: isLockedInFreeTrial,
            free_trial_featured_exam: studentAttachedExam.exam.free_trial_featured_exam,
          })
        }

        /**
         * Check if a review for given course and student exam id is present - if so, skip
         * This is to prevent duplicate reviews from being created (e.g. the review is archived, but the exam is "incomplete", hence a duplicate review is created)
         */
        const existingReview = await findcalendarEvent({ student_course_id: studentCourse.id, student_exam_id: studentAttachedExam.exam_id, type: CalendarEventType.chapterExamReview })

        if (existingReview) {
          return
        }

        const firstSection = findFirstSection(studentAttachedExam.exam.sections)

        /**
         * TODO
         *
         * Handle no first section found - log and return
         */

        await createCalendarEvent(studentCourse, CalendarEventType.chapterExamReview, {
          title: getTitle(studentChapters, calendarChapter, studentAttachedExam),
          description: studentAttachedExam.exam.originalExam.custom_title,
          event_date: eventDate.clone().format(DATE_FORMAT_YMD),
          duration: examLength,
          action_uri: `/exam/${studentAttachedExam.exam_id}/score-report/score-sheet`,
          event_colour: studentChapters[calendarChapter.chapter_id].tag_colour,
          student_item_id: reviewVideoId,
          student_exam_id: studentAttachedExam.exam_id,
          from_manual_setup: isArchived,
          status: isArchived ? CalendarEventStatus.archived : CalendarEventStatus.incomplete,
          is_locked_in_free_trial: isLockedInFreeTrial,
          free_trial_featured_exam: studentAttachedExam.exam.free_trial_featured_exam,
        })
      }
    }
  }
}
