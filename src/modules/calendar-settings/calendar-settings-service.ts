import { CalendarExamFrequency } from './calendar-exam-frequency'
import { findOne, create, findOneOrFail, patch } from './calendar-settings-repository'

type Payload = {
  preferred_days_full_length_exam?: number[] | string,
  preferred_days_section_exam?: number[] | string,
  full_length_exam_frequency?: string,
  section_exam_frequency?: string,
  preferred_days_chapters?: number[] | string,
}

export const createDefaultCalendarSettings = async (courseId: string) => {
  const settings = await findOne({ course_id: courseId })

  if (settings) {
    return settings
  }

  return create({
    course_id: courseId,
    preferred_days_full_length_exam: JSON.stringify([6]),
    preferred_days_section_exam: JSON.stringify([3]),
    full_length_exam_frequency: CalendarExamFrequency.everyOtherWeek,
    section_exam_frequency: CalendarExamFrequency.everyWeek,
    chapter_exam_delay: 0,
    preferred_days_chapters: JSON.stringify([3]),
  })
}

export const updateCalendarSettings = async (courseId: string, payload: Payload) => {
  const settings = await findOneOrFail({ course_id: courseId })

  if (payload.preferred_days_full_length_exam) {
    payload.preferred_days_full_length_exam = JSON.stringify(payload.preferred_days_full_length_exam)
  }

  if (payload.preferred_days_section_exam) {
    payload.preferred_days_section_exam = JSON.stringify(payload.preferred_days_section_exam)
  }

  if (payload.preferred_days_chapters) {
    payload.preferred_days_chapters = JSON.stringify(payload.preferred_days_chapters)
  }

  return patch(settings.id, payload)
}
