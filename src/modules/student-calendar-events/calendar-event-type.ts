/**
 * todo describe every event type
 */

export enum CalendarEventType {
  bookLink = 'book_link', // Chapter reading event
  bookLinkPreReading = 'book_link_pre_reading', // Pre-reading event
  fullLengthExam = 'full_length_exam', // Full length exam event
  fullLengthExamReview = 'full_length_exam_review', // Full length exam review event
  chapterExam = 'chapter_exam', // Chapter exam event
  chapterExamReview = 'chapter_exam_review', // Chapter exam review event
  sectionExam = 'section_exam', // Section exam event
  sectionExamReview = 'section_exam_review', // Section exam review event
  customSectionExam = 'custom_section_exam', // Custom section exam event (added manually by user or from archive)
  customSectionExamReview = 'custom_section_exam_review', // Custom section exam review event (added manually by user or from archive)
  custom = 'custom', // Custom event (manually added, not related to course)
  customEventType = 'custom_event_type', // Custom event type
  customFullLengthExam = 'custom_full_length_exam', // Custom full length exam event (added manually by user or from archive)
  customFullLengthExamReview = 'custom_full_length_exam_review', // Custom full length exam review event (added manually by user or from archive)
  otherExam = 'other_exam',
  otherExamReview = 'other_exam_review',
  liveClass = 'live_class', // Live class event (from live course, defined by admin)
  customLiveClass = 'custom_live_class', // Alternative live class event, from different semester
  customEndDateEvent = 'custom_end_date_event', // Custom semester event, created by admin (prepared for SASSEK)
}

export const CalendarEventTypeValues = Object.values(CalendarEventType)
