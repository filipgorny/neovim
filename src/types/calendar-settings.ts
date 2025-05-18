import { CalendarExamFrequency } from '../modules/calendar-settings/calendar-exam-frequency'

export type CalendarSettings = {
  id: string,
  course_id: string,
  preferred_days_full_length_exam: number[],
  preferred_days_section_exam: number[],
  full_length_exam_frequency: CalendarExamFrequency,
  section_exam_frequency: CalendarExamFrequency,
  chapter_exam_delay: number,
  preferred_days_chapters: number[],
}
